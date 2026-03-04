import { Link } from "react-router-dom";

export const AccessDeniedPage = () => {
  return (
    <div className="centered-page">
      <h1>Ruxsat yo'q</h1>
      <p>Sizda ushbu sahifani ochish uchun ruxsat mavjud emas.</p>
      <Link className="btn btn--primary" to="/dashboard">
        Boshqaruv paneliga o'tish
      </Link>
    </div>
  );
};
