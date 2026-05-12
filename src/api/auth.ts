import { supabase } from "../client";

type SignUpInput = {
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  password: string;
  birthday: string;
  phoneNumber: string;
  genderIdentity: string;
  pronouns: string;
};

export async function signUp(input: SignUpInput) {
  const {
    firstName,
    lastName,
    preferredName,
    email,
    password,
    birthday,
    phoneNumber,
    genderIdentity,
    pronouns,
  } = input;

  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        preferred_name: preferredName?.trim() || null,
        birthdate: birthday,
        phone_number: phoneNumber?.trim() || null,
        gender_identity: genderIdentity.trim(),
        pronouns: pronouns.trim(),
      },
    },
  });

  if (error) {
    console.error("Sign-up failed:", error.message);
  }
  return {data, error};
}

export async function signIn(email: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) console.error("Sign-in failed:", error.message);
  return {data, error};
}

export async function signOut() {
  const {error} = await supabase.auth.signOut();

  if (error) console.error("Sign-out failed:", error.message);
  return {error};
}

// Redirects back to local host 
// Must be updated after we launch website 
export async function sendPasswordResetEmail(email: string){
  const {data, error} = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5173/lock-it/reset-password",
  });
  if (error) {
    console.error("Password reset email failed:", error.message);
  }
  return {data, error};
}

// Sets new password for user 
// uses token from URL 
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Password update failed:", error.message);
  }

  return { data, error };
}
