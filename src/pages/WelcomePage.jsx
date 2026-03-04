import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { ApiErrorAlert } from "../components/common/ApiErrorAlert";

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, authLoading } = useAuth();
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      if (
        loginError instanceof Error &&
        loginError.message.includes(
          "Backend callback front-end manziliga redirect",
        )
      ) {
        setError(
          "Kirish yakunlanmadi. Tizim sozlamalari yangilanmoqda, keyinroq qayta urinib ko'ring.",
        );
        return;
      }

      setError(loginError);
    }
  };

  return (
    <div className="welcome-page">
      <main className="welcome-page__content">
        <div className="welcome-page__logo" aria-hidden="true">
          <FaLeaf />
        </div>
        <h1>GreenID</h1>
        <p className="welcome-page__description">
          GreenID bu jamiyatga tayangan ekologik tozalash platformasi bo‘lib,
          fuqarolar o‘z hududidagi real natijalarni yuklaydi, shaffof ball oladi
          va birgalikda toza hamda sog‘lom mahalla yaratadi.
        </p>

        <button
          type="button"
          className="btn btn--primary btn--large"
          onClick={handleGoogleLogin}
          disabled={authLoading}
        >
          {authLoading ? "Ulanmoqda..." : "Google orqali kirish"}
        </button>

        <ApiErrorAlert error={error} />
      </main>

      <footer className="welcome-page__footer">
        <span>© 2026 GreenID</span>
        <span>Barcha huquqlar himoyalangan</span>
        <a href="https://t.me/BehruzXurramov" target="_blank" rel="noreferrer">
          Telegram
        </a>
      </footer>
    </div>
  );
};
