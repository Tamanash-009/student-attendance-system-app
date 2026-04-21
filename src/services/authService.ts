import { supabase } from '../lib/supabase';

export const authService = {
  isAuthenticated: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  login: async (pin: string): Promise<boolean> => {
    // Note: Since Supabase requires email/password, we are temporarily
    // mapping the "pin" to a dummy email/password just to keep the UI
    // flow simple. Ideally this would be replaced with a real email/password UI.
    const email = `admin_${pin}@attendify.local`;
    const password = `secure_pin_${pin}`;
    
    // Check if the mock credentials login works
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      // If it fails, maybe the account doesn't exist yet.
      // We will mock auto signup for the demo "1234" pin
      if (pin === '1234' || pin === 'admin') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (!signUpError) return true;
        return false;
      }
      return false;
    }
    
    return true;
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  }
};
