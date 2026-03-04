import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="centered-page">
      <h1>Sahifa topilmadi</h1>
      <p>So'ralgan sahifa mavjud emas.</p>
      <Link className="btn btn--primary" to="/">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
};
