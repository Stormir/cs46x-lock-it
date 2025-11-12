import { useEffect, useState } from "react";
import { supabase } from "../client";

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Checks if a user is already logged in
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error);
      setSession(data.session);
      setLoading(false);
    };
    getSession();

    // Listens for login/logout changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    //Cleans up the listener when done
    return () => subscription.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
