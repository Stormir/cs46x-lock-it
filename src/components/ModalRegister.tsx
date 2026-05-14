import React from "react";

import Modal from "./Modal";
import { signUp } from "../api/auth";

interface ModalRegisterProps {
  setViewNone: () => void;
}

// Registration for new users
type RegisterForm = {
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthday: string;
  phoneNumber: string;
  genderIdentity: string;
  pronouns: string;
};

const ModalRegister: React.FC<ModalRegisterProps> = ({
  setViewNone
}) => {
  // Register Form
  const [form, setForm] = React.useState<RegisterForm>({
    firstName: "",
    lastName: "",
    preferredName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    phoneNumber: "",
    genderIdentity: "",
    pronouns: ""
  });

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setViewNone();
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      form.firstName &&
      form.lastName &&
      form.email &&
      form.password &&
      form.confirmPassword &&
      form.birthday &&
      form.phoneNumber &&
      form.genderIdentity &&
      form.pronouns
    ) {
      if (form.password === form.confirmPassword) {
        const { error } = await signUp({
          firstName: form.firstName,
          lastName: form.lastName,
          preferredName: form.preferredName,
          email: form.email,
          password: form.password,
          birthday: form.birthday,
          phoneNumber: form.phoneNumber,
          genderIdentity: form.genderIdentity,
          pronouns: form.pronouns,
        });

        if (!error) {
          alert("Sign-up successful! Please check your email to confirm your account.");
          setViewNone();
        } else {
          alert(error.message);
        }
      } else {
        alert("Passwords do not match");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  return (
    <Modal>
      <h2 className="text-center text-lg font-semibold text-[#382543] mb-4">
        Register
      </h2>

      <form onSubmit={handleSubmitForm}>
        <div className="flex flex-col gap-4">
          {/* First Name */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            First Name:
            <input
              name="firstName"
              onChange={handleChangeInput}
              required
              type="text"
              value={form.firstName}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {/* Last Name */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Last Name:
            <input
              name="lastName"
              onChange={handleChangeInput}
              required
              type="text"
              value={form.lastName}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {/* Preferred Name */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Preferred Name:
            <input
              name="preferredName"
              onChange={handleChangeInput}
              type="text"
              value={form.preferredName}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Confirm Password:
            <input
              name="confirmPassword"
              onChange={handleChangeInput}
              required
              type="password"
              value={form.confirmPassword}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {/* Birthday */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Birthday:
            <input
              name="birthday"
              onChange={handleChangeInput}
              required
              type="date"
              value={form.birthday}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {/* Phone Number */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Phone Number:
            <input
              name="phoneNumber"
              onChange={handleChangeInput}
              required
              type="tel"
              value={form.phoneNumber}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {/* Gender Identity */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Gender Identity:
            <input
              name="genderIdentity"
              onChange={handleChangeInput}
              required
              type="text"
              value={form.genderIdentity}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          {/* Pronouns */}
          <label className="flex flex-col gap-1 text-sm text-[#382543]">
            Pronouns:
            <input
              name="pronouns"
              onChange={handleChangeInput}
              required
              type="text"
              value={form.pronouns}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        </div>

        {/* Buttons*/}
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