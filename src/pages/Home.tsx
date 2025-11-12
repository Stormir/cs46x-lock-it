import React from "react";

interface HomeProps {
  setPageLanding: () => void;
}

const Home: React.FC<HomeProps> = ({ setPageLanding }) => (
  <>
    <header>
      <h1>Glimmr</h1>
    </header>
    <main>
      <button onClick={() => setPageLanding()} type="button">
        Sign Out
      </button>
    </main>
  </>
);

export default Home;
