import { PrismaClient } from '@prisma/client';
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useFetcher } from '@remix-run/react';

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

  await db.entry.create({
    data: {
      date: new Date(date),
      category,
      text,
    },
  });
  return redirect('/');
}

export default function Index() {
  const fetcher = useFetcher();
  return (
    <div className='p-10'>
      <h1 className='text-5xl'>Work Journal</h1>
      <p className='mt-2 text-lg text-gray-400'>
        Learning and doings. updated weekely.
      </p>
      <div className='my-8 border p-2'>
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
                />
              </div>
              <label>
                <input
                  required
                  className='mr-1'
                  type='radio'
                  name='category'
                  value='work'
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
      <div className='mt-3 space-y-4'>
        <div>
          <p className='font-bold'>Work</p>
          <ul className='ml-8 list-disc'>
            <li>First item</li>
            <li>First item</li>
            <li>First item</li>
          </ul>
        </div>
        <div>
          <p className='font-bold'>Learning</p>
          <ul className='ml-8 list-disc'>
            <li>First item</li>
            <li>First item</li>
            <li>First item</li>
          </ul>
        </div>
        <div>
          <p className='font-bold'>Interesting things</p>
          <ul className='ml-8 list-disc'>
            <li>First item</li>
            <li>First item</li>
            <li>First item</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
