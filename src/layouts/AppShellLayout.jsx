import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export const AppShellLayout = ({ title, sidebar, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="app-shell">
      <header className="app-shell__mobile-header">
        <button
          type="button"
          className="icon-btn"
          onClick={toggleMenu}
          aria-label="Menyuni ochish yoki yopish"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
        <h1>{title}</h1>
      </header>

      <div
        className={`app-shell__overlay ${menuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />

      <aside className={`app-shell__sidebar ${menuOpen ? "is-open" : ""}`}>
        {sidebar}
      </aside>

      <main className="app-shell__main">{children}</main>
    </div>
  );
};
