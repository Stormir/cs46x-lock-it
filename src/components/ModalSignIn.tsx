import React from "react";

import Modal from "./Modal";
import { signIn } from "../api/auth";
import { ComingSoon } from "./ComingSoon";

interface ModalSignInProps {
  setPageHome: () => void;
  setViewNone: () => void;
}

type SignInForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const ModalSignIn: React.FC<ModalSignInProps> = ({
  setPageHome,
  setViewNone
}) => {
  const [form, setForm] = React.useState<SignInForm>({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleChangeCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetForm = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setViewNone();
  };

// Adds asynch version to handleSumbitForm 
  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.email && form.password) {
      const { error } = await signIn(form.email, form.password);
      if (!error) {
        setPageHome();
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <Modal>
      {/* Sets up email form field */}
      <h2 className="text-center text-lg font-semibold text-[#382543] mb-4">
        Sign In  
      </h2>
      <form onSubmit={handleSubmitForm}>
        <label  className="flex flex-col gap-1 text-sm text-[#382543]">
          Email:
          <input
            name="email"
            onChange={handleChangeInput}
            required
            type="email"
            value={form.email}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        {/* Sets up password form field*/}
        <label className="flex flex-col gap-1 text-sm text-[#382543]">
          Password:
          <input
            name="password"
            onChange={handleChangeInput}
            required
            type="password"
            value={form.password}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        {/* Stormi: Sets up forget password component
          enables coming soon component 
        */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            disabled
            className="text-sm underline opacity-60 cursor-not-allowed"
          >
          forgot password
        </button>
        <ComingSoon />
        </div>
        
        <div className="mt-5 flex justify-center gap-6">
          <button
            type="submit"
            className="text-sm underline text-[#382543] font-medium"        
          > 
            Submit
          </button>

          <button
            type="reset" 
            onClick={handleResetForm}
            className="text-sm underline text-[#382543] font-medium"  
          >
            Cancel
          </button>
        </div>

        <label>
          <input
            checked={form.rememberMe}
            name="rememberMe"
            onChange={handleChangeCheck}
            type="checkbox"
          />
          Remember me
        </label>
      </form>
    </Modal>
  );
};

export default ModalSignIn;
