import { PrismaClient } from '@prisma/client';
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import EntryForm from '~/components/entry-form';

export async function action({ request, params }: ActionFunctionArgs) {
  const db = new PrismaClient();
  let formData = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { _action, date, category, text } = Object.fromEntries(formData);

  if (_action === 'delete') {
    await db.entry.delete({
      where: { id: +params.entryId },
    });
    return redirect('/');
  } else if (
    typeof date !== 'string' ||
    typeof category !== 'string' ||
    typeof text !== 'string'
  ) {
    throw new Error('Bad request');
  }

  await db.entry.update({
    where: { id: Number(params.entryId) },
    data: {
      date: new Date(date),
      category,
      text,
    },
  });
  return redirect('/');
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  let db = new PrismaClient();
  const entry = await db.entry.findUnique({
    where: { id: Number(params.entryId) },
  });

  if (typeof params.entryId !== 'string') {
    throw new Response('Not found', { status: 404 });
  }

  if (!entry) {
    throw new Response('Not found', { status: 404 });
  }

  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  };
};

export default function EditPage() {
  const entry = useLoaderData<typeof loader>();

  function handleSubmit(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
  }

  return (
    <div className='mt-4'>
      <p>Editing entry {entry.id}</p>
      <EntryForm entry={entry} />
      <div className='mt-8'>
        <Form method='post'>
          <button
            onSubmit={(e) => handleSubmit}
            name='_action'
            value='delete'
            className='text-red-500 hover:text-red-700'
          >
            Delete this entry...
          </button>
        </Form>
      </div>
    </div>
  );
}
