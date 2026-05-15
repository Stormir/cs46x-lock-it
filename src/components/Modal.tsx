import React from "react";

interface ModalProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ children }) => {
  return (
  <div
    className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
    aria-hidden={false}
  >
    <div className="flex min-h-full justify-center py-8">
      <aside
        role="dialog"
        aria-modal="true"
        className="my-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        {children}
      </aside>
    </div>
  </div>
);
};

export default Modal;
