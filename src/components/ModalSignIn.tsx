import React from "react";

import Modal from "./Modal";

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

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.email && form.password) {
      setPageHome();
    }
  };

  return (
    <Modal>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmitForm}>
        <label>
          Email:
          <input
            name="email"
            onChange={handleChangeInput}
            required
            type="email"
            value={form.email}
          />
        </label>
        <label>
          Password:
          <input
            name="password"
            onChange={handleChangeInput}
            required
            type="password"
            value={form.password}
          />
        </label>
        <button type="submit">Submit</button>
        <button type="reset" onClick={handleResetForm}>
          Cancel
        </button>
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
