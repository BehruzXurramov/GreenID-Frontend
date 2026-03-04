import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const userRaw = params.get("user");

    if (!accessToken || !userRaw) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      login({ accessToken, user });
      navigate("/dashboard", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className="centered-page">
      <h1>Kirish yakunlanmoqda...</h1>
      <p>Iltimos biroz kuting.</p>
    </div>
  );
};
