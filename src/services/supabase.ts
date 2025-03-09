import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://jwcpacdjriulorukcmgc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Y3BhY2Rqcml1bG9ydWtjbWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NDI5MjksImV4cCI6MjA1NzAxODkyOX0.lgvwnVgE-xNQIx4-h3kwSwB7c8Adw2xgqQkdinFOmwk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Função auxiliar para verificar se é administrador
export const isAdmin = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.email === 'camilomelo8428@gmail.com';
};

// Função para login
export const loginWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Função para logout
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export default supabase; 