import React from "react";

import Modal from "./Modal";
import { signUp } from "../api/auth";

interface ModalRegisterProps {
  setPageHome: () => void;
  setViewNone: () => void;
}

type RegisterForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const ModalRegister: React.FC<ModalRegisterProps> = ({
  setPageHome,
  setViewNone
}) => {
  // Register Form 
  const [form, setForm] = React.useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetForm = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setViewNone();
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      form.fullName &&
      form.email &&
      form.password &&
      form.confirmPassword
    ) {
      if (form.password === form.confirmPassword) {
      const { error } = await signUp(form.email, form.password);
      if (!error) {
        // moves to Home on success
        setPageHome();              
      } else {
        // surfaces Supabase error
        alert(error.message);       
      }
    } else {
      alert("Passwords do not match");
      }
    }
  };

  return (
    <Modal>
      <h2 className="text-center text-lg font-semibold text-[#382543] mb-4">
        Register
      </h2>

      <form onSubmit={handleSubmitForm}>
        {/* Stacks Inputs */}
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Full Name:
            <input
              name="fullName"
              onChange={handleChangeInput}
              required
              type="text"
              value={form.fullName}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[#382543]">
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

        <label className="flex flex-col gap-1 text-sm text-[#382543]">
          Confirm password:
          <input
            name="confirmPassword"
            onChange={handleChangeInput}
            required
            type="password"
            value={form.confirmPassword}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      {/* Buttons w/ underlining*/}
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
      </form>
    </Modal>
  );
};

export default ModalRegister;
