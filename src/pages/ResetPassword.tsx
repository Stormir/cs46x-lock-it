import React from "react";
import { updatePassword, signOut } from "../api/auth";

type ResetPasswordProps = {
  setPageLanding: () => void;
};

const ResetPassword: React.FC<ResetPasswordProps> = ({setPageLanding}) => {
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // if password and confirm password don't match send alert
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Handles update password backend call     
    const { error } = await updatePassword(password);
    // Checks for error, if not sends confirmation 
    if (error) {
      alert(error.message);
    } else {
      await signOut();
      alert("Password updated! You can log in now.");
      setPageLanding();
    }
};

 return (
    <div className="min-h-screen bg-[#382543] flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h1 className="text-center text-lg font-semibold text-[#382543] mb-4">
          Reset Password
        </h1>

        <label className="flex flex-col gap-1 text-sm text-[#382543]">
          New password:
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[#382543] mt-3">
          Confirm password:
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <div className="mt-5 flex justify-center gap-6">
          <button
            type="submit"
            className="text-sm underline text-[#382543] font-medium"
          >
            Update Password
          </button>

          <button
            type="button"
            onClick={setPageLanding}
            className="text-sm underline text-[#382543] font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;