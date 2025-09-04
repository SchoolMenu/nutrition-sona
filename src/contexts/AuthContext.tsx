import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'parent' | 'cook' | 'admin';
  school_code: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'parent' | 'cook' | 'admin', schoolCode: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    console.log('Initializing auth context...');
    
    // Set up auth state listener FIRST (must be synchronous to prevent deadlock)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      } else {
        console.log('Initial session check:', session?.user?.email);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Session check failed:', err);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separate effect to fetch profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setProfileLoading(true);
        console.log('Fetching profile for user:', user.id);
        
        try {
          const { data: profileData, error } = await supabase
            .from('profiles' as any)
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            if (error.code === '42501' || error.code === '42P01') {
              console.log('Profile table might not exist or RLS policy issues');
            }
          } else {
            console.log('Profile fetched successfully:', profileData);
          }
          
          setProfile(profileData as any);
        } catch (err) {
          console.error('Profile fetch failed:', err);
          setProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const signUp = async (email: string, password: string, fullName: string, role: 'parent' | 'cook' | 'admin', schoolCode: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          school_code: schoolCode
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful');
      }
      
      return { error };
    } catch (err) {
      console.error('Sign in failed:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};