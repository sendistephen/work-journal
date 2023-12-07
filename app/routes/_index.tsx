import { PrismaClient } from '@prisma/client';
import type { ActionFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { useEffect, useRef } from 'react';

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
  console.log(entries);

  // const example = {
  //   '2023/12/23': ['entry1,entry2,entry3'],
  //   '2023/12/13': ['entry1,entry2,entry3'],
  //   '2023/12/03': ['entry1,entry2,entry3'],
  // };

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

  console.log(weeks);

  useEffect(() => {
    if (fetcher.state === 'idle' && textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current?.focus();
    }
  }, [fetcher.state]);

  return (
    <div className='p-10 max-w-2xl mx-auto'>
      <h1 className='text-5xl'>Work Journal</h1>
      <p className='mt-2 text-lg text-gray-400'>
        Learning and doings. updated weekely.
      </p>
      <div className='my-8 border border-gray-700 rounded-lg p-4'>
        <p className='italic'>Create an entry</p>
        <fetcher.Form method='post'>
          <fieldset
            className='disabled:opacity-80'
            disabled={fetcher.state === 'submitting'}
          >
            <div className='space-x-6'>
              <div>
                <input
                  required
                  type='date'
                  name='date'
                  className='text-gray-700'
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <label>
                <input
                  required
                  className='mr-1'
                  type='radio'
                  name='category'
                  value='work'
                  defaultChecked
                />
                Work
              </label>
              <label>
                <input
                  className='mr-1'
                  type='radio'
                  name='category'
                  value='learning'
                />
                Learning
              </label>
              <label>
                <input
                  className='mr-1'
                  type='radio'
                  name='category'
                  value='interesting-thing'
                />
                Interesting Thing
              </label>
            </div>
            <div className='mt-6'>
              <textarea
                ref={textareaRef}
                required
                name='text'
                placeholder='Write your entry...'
                className='w-full text-gray-700 text-sm'
              ></textarea>
            </div>
            <div className='mt-4 text-right'>
              <button
                disabled={fetcher.state === 'submitting'}
                type='submit'
                className='bg-green-500 text-white px-4 py-1'
              >
                {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
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
                  <p className='font-bold border-l-4 border-green-700 text-green-700'>Work</p>

                  <ul className='ml-8 list-disc'>
                    {week.work.map((entry) => (
                      <li key={entry.id}>{entry.text}</li>
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
                      <li key={entry.id}>{entry.text}</li>
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
                      <li key={entry.id}>{entry.text}</li>
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
