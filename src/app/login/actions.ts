'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import { cookies } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Database connection not configured.' }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/cold-calls', 'layout')
  redirect('/cold-calls')
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()
  if (!supabase) return { error: 'Database connection not configured.' }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Handle referral if present
  if (authData.user) {
    const cookieStore = await cookies();
    const referralCode = cookieStore.get('lumen_referral')?.value;

    if (referralCode) {
      // Find the referrer
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrer) {
        await supabase
          .from('profiles')
          .update({ referred_by: referrer.id })
          .eq('id', authData.user.id);
      }
    }
  }

  revalidatePath('/cold-calls', 'layout')
  redirect('/cold-calls')
}
