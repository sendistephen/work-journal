import { PrismaClient } from '@prisma/client';
import type { ActionFunctionArgs } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { useEffect, useRef } from 'react';
import EntryForm from '~/components/entry-form';

export async function action({ request }: ActionFunctionArgs) {
  const db = new PrismaClient();
  let formData = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { date, category, text } = Object.fromEntries(formData);
  if (
    typeof date !== 'string' ||
    typeof category !== 'string' ||
    typeof text !== 'string'
  ) {
    throw new Error('Bad request');
  }

  return await db.entry.create({
    data: {
      date: new Date(date),
      category,
      text,
    },
  });
}

export async function loader() {
  const db = new PrismaClient();
  const entries = await db.entry.findMany();
  return entries.map((entry) => ({
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }));
}

export default function Index() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fetcher = useFetcher();
  const entries = useLoaderData<typeof loader>();

  const entriesByWeek = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      const sunday = startOfWeek(parseISO(entry.date));
      const sundayString = format(sunday, 'yyy-MM-dd');

      memo[sundayString] ||= [];
      memo[sundayString].push(entry);

      return memo;
    },
    {}
  );

  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter(
        (entry) => entry.category === 'work'
      ),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.category === 'learning'
      ),
      interestingThing: entriesByWeek[dateString].filter(
        (entry) => entry.category === 'interesting-thing'
      ),
    }));

  useEffect(() => {
    if (fetcher.state === 'idle' && textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current?.focus();
    }
  }, [fetcher.state]);

  return (
    <div>
      <div className='my-8 border border-gray-700 rounded-lg p-4'>
        <p className='italic'>Create an entry</p>
        <EntryForm />
      </div>
      {weeks.map((week) => (
        <div key={week.dateString} className='mt-6'>
          <div>
            <p className='font-bold'>
              Week of {format(parseISO(week.dateString), 'MMMM do')}
            </p>
            <div className='mt-3 space-y-4'>
              {week.work.length > 0 && (
                <div>
                  <p className='font-bold border-l-4 border-green-700 text-green-700'>
                    Work
                  </p>

                  <ul className='ml-8 list-disc'>
                    {week.work.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p className='font-bold border-l-4 border-sky-700 text-sky-700'>
                    Learnings
                  </p>

                  <ul className='ml-8 list-disc'>
                    {week.learnings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThing.length > 0 && (
                <div>
                  <p className='font-bold border-l-4 border-pink-700 text-pink-700'>
                    Interesting Thing
                  </p>

                  <ul className='ml-8 list-disc'>
                    {week.interestingThing.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function EntryListItem({
  entry,
}: {
  entry: Awaited<ReturnType<typeof loader>>[number];
}) {
  return (
    <li className='group text-sm'>
      {entry.text}
      <Link
        className='ml-2 text-blue-600 opacity-0 group-hover:opacity-100'
        to={`/entries/${entry.id}/edit`}
      >
        Edit
      </Link>
    </li>
  );
}
