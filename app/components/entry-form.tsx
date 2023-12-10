import { useFetcher } from '@remix-run/react';
import { useRef } from 'react';

export default function EntryForm({
  entry,
}: {
  entry?: {
    text: string;
    date: string;
    category: string;
  };
}) {
  const fetcher = useFetcher();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <fetcher.Form method='post'>
      <fieldset
        className='disabled:opacity-80'
        disabled={fetcher.state === 'submitting'}
      >
        <div className='space-x-6'>
          <div>
            <input
              type='date'
              name='date'
              className='text-gray-700'
              defaultValue={entry?.date}
              required
            />
          </div>
          <label>
            <input
              className='mr-1'
              type='radio'
              name='category'
              value='work'
              defaultChecked={entry?.category === 'work'}
              required
            />
            Work
          </label>
          <label>
            <input
              className='mr-1'
              type='radio'
              name='category'
              value='learning'
              defaultChecked={entry?.category === 'learning'}
            />
            Learning
          </label>
          <label>
            <input
              className='mr-1'
              type='radio'
              name='category'
              value='interesting-thing'
              defaultChecked={entry?.category === 'interesting-thing'}
            />
            Interesting Thing
          </label>
        </div>
        <div className='mt-6'>
          <textarea
            ref={textareaRef}
            name='text'
            defaultValue={entry?.text}
            placeholder='Write your entry...'
            className='w-full text-gray-700 text-sm'
            required
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
  );
}
