import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";
import { ApiErrorAlert } from "../components/common/ApiErrorAlert";
import { useAuth } from "../hooks/useAuth";

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState(null);
  const googleLoginUrl = useMemo(
    () =>
      import.meta.env.VITE_GOOGLE_LOGIN_URL ||
      `${import.meta.env.VITE_API_BASE_URL || "https://bestapi.uz/greenid"}/auth/google`,
    []
  );

  const handleGoogleLogin = () => {
    setError(null);
    if (!googleLoginUrl) {
      setError("Google kirish manzili topilmadi.");
      return;
    }

    window.location.href = googleLoginUrl;
  };

  const handleGoDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    // Fallback: agar backend root'ga query bilan qaytarsa, shu yerda sessionni saqlab yuboramiz.
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const userRaw = params.get("user");

    if (!accessToken || !userRaw) {
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      login({ accessToken, user });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Kirish ma'lumotlarini o'qib bo'lmadi. Qayta urinib ko'ring.");
    }
  }, [login, navigate]);

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

        {isAuthenticated ? (
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={handleGoDashboard}
          >
            Dashboardga o‘tish
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={handleGoogleLogin}
          >
            Google orqali kirish
          </button>
        )}

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
