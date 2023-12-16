import { useFetcher } from '@remix-run/react';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus();
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <fetcher.Form method='post'>
      <fieldset
        className='disabled:opacity-80'
        disabled={fetcher.state !== 'idle'}
      >
        <div className=''>
          <div>
            <input
              type='date'
              name='date'
              className='text-gray-700'
              defaultValue={entry?.date ?? format(new Date(), 'yyy-MM-dd')}
              required
            />
          </div>
          <div className='mt-4 space-x-4'>
            {[
              { label: 'Work', value: 'work' },
              { label: 'Learning', value: 'learning' },
              { label: 'Interesting thing', value: 'interesting-thing' },
            ].map((option) => (
              <label key={option.value} className='inline-block'>
                <input
                  className='mr-1'
                  type='radio'
                  name='category'
                  value={option.value}
                  defaultChecked={option.value === (entry?.category ?? 'work')}
                  required
                />
                {option.label}
              </label>
            ))}
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
              {fetcher.state !== 'idle' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
