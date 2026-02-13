import React from "react";

interface ModalProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ children }) => {
  return(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      aria-hidden={false}
    >
      <aside
      role="dialog"
      aria-modal="true"
      className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        {children}
      </aside>    
    </div>
  );
};

export default Modal;
