'use server'
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

async function getFullName() {
  const user = await currentUser();
  if (user) {
    return String(user.fullName);
  }
  return null;
}

async function getuserID() {
  const user = await currentUser();
  if (user) {
    return String(user.id);
  }
  return null;
}

const ReferralSchema = z.object({
  cardetail: z.string(),
  carvin: z.string(),
  amount: z.coerce.number().default(0),
  amount_paid: z.coerce.number().default(0),
  status: z.enum(['pending', 'paid']).default('pending'),
  date: z.string(),
});

export type State = {
  errors?: {
    cardetail?: string[];
    carvin?: string[];
    amount?: string[];
    amount_paid?: string[];
    status?: string[];
    date?: string[];
  };
  message?: string | null;
};


export async function createReferral(prevState: State, formData: FormData): Promise<State> {
  const username = await getFullName();
  const id = await getuserID();

  


  if (!username && !id) {
    return {
      errors: {},
      message: 'User not authenticated.',
    };
  }


  const validatedFields = ReferralSchema.safeParse({
    cardetail: formData.get('cardetail'),
    carvin: formData.get('carvin'),
    amount: formData.get('amount'),
    amount_paid: formData.get('amount_paid'),
    status: formData.get('status'),
    date: new Date().toISOString(),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create referral.',
    };
  }

  const { cardetail, carvin, amount, amount_paid, status, date } = validatedFields.data;
  const amountinCents = amount * 100;
  const amount_paidinCents = amount_paid * 100;

   // Remove this when supabase if fully implemented
  
  const { error } = await supabase
    .from('referraldata')
    .insert([{
      cardetail: cardetail,
      carvin: carvin,
      user_id: id,
      name: username,
      amount: amountinCents,
      amount_paid: amount_paidinCents,
      status: status,
      date: date
    }])
  if (error) {
    console.error(error);
    return {
      errors: {},
      message: error.message,
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');

  return { message: null, errors: {} };
}

export async function createReferralM(prevState: State, formData: FormData): Promise<State> {
  const username = await getFullName();
  const id = await getuserID();

  if (!username && !id) {
    return {
      errors: {},
      message: 'User not authenticated.',
    };
  }


  const validatedFields = ReferralSchema.safeParse({
    cardetail: formData.get('cardetail'),
    carvin: formData.get('carvin'),
    status: "pending",
    date: new Date().toISOString(),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create referral.',
    };
  }

  const { cardetail, carvin, status, date } = validatedFields.data;
  const amountinCents = 0;
  const amount_paidinCents = 0;


  const { error } = await supabase
    .from('referraldata')
    .insert([{
      cardetail: cardetail,
      carvin: carvin,
      user_id: id,
      name: username,
      amount: amountinCents,
      amount_paid: amount_paidinCents,
      status: status,
      date: date
    }])
  if (error) {
    console.error(error);
    return {
      errors: {},
      message: error.message,
    };
  }

  // Send push notification to admin users
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'new_referral',
        message: `New car referral submitted by ${username}. Car: ${cardetail}`,
      }),
    });
  } catch (notificationError) {
    console.error('Failed to send push notification:', notificationError);
    // Don't fail the whole operation if notification fails
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');

  return { message: null, errors: {} };
}





const UpdateReferralSchema = ReferralSchema.extend({
  id: z.string(),
});


export async function updateReferral(id: string, formData: FormData): Promise<any> {
  const validatedFields = UpdateReferralSchema.parse({
    id,
    cardetail: formData.get('cardetail'),
    carvin: formData.get('carvin'),
    amount: formData.get('amount'),
    amount_paid: formData.get('amount_paid'),
    status: formData.get('status'),
    date: new Date().toISOString(),

  });

  const { cardetail, carvin, amount, amount_paid, status } = validatedFields;
  const amountinCents = amount * 100;
  const amount_paidinCents = amount_paid * 100;

  // Remove this when supabase if fully implemented

    

  const { error } = await supabase
    .from('referraldata')
    .update({
      cardetail: cardetail,
      carvin: carvin,
      amount: amountinCents,
      amount_paid: amount_paidinCents,
      status: status,
      date: new Date().toISOString()
    })
    .eq('id', id);

    
  if (error) {
    console.error(error);
    throw new Error('Failed to update referral.');
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteReferral(id: string) {

  const { error } = await supabase
    .from('referraldata')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    throw new Error('Failed to delete referral.');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteReferralM(id: string) {
  try {
    await sql`
      DELETE FROM referralData
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete referral.');

  }
  const { error } = await supabase
    .from('referraldata')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    throw new Error('Failed to delete referral.');
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

