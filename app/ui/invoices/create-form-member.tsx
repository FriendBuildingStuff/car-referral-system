"use client"
import Link from 'next/link';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createReferralM, State } from '@/app/lib/actions-m';
import { useActionState, useEffect } from 'react';
import { user } from '@/app/lib/definitions-t';

export default function Form({ usersf }: { usersf: user[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createReferralM, initialState);

  // Show success notification when form is submitted successfully
  useEffect(() => {
    if (state.message && !state.errors && Object.keys(state.errors || {}).length === 0) {
      console.log('Form submitted successfully, sending notification...');
      // Trigger notification to users
      sendNotificationToUsers();
    }
  }, [state]);

  const sendNotificationToUsers = async () => {
    try {
      console.log('Sending notification to users...');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_referral',
          message: 'New car referral has been submitted and requires attention',
        }),
      });
      
      const result = await response.json();
      console.log('Notification response:', result);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="carDetail" className="mb-2 block text-sm font-medium">
            Car Year Make Model
          </label>
          <input
            id="carDetail"
            name="cardetail"
            type="text"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="carDetail-error"
          />
          {state.errors?.cardetail?.map((error) => (
            <p key={error} id="carDetail-error" className="mt-2 text-sm text-red-500">
              {error}
            </p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="carVin" className="mb-2 block text-sm font-medium">
            Car VIN
          </label>
          <input
            id="carVin"
            name="carvin"
            type="text"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            aria-describedby="carVin-error"
          />
          {state.errors?.carvin?.map((error) => (
            <p key={error} id="carVin-error" className="mt-2 text-sm text-red-500">
              {error}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600"
        >
          Cancel
        </Link>
        <Button type="submit">Create Referral</Button>
      </div>
    </form>
  );
}
