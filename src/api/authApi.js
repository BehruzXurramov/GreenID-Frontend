import { API_BASE_URL } from "./client";

const GOOGLE_LOGIN_URL =
  import.meta.env.VITE_GOOGLE_LOGIN_URL || `${API_BASE_URL}/auth/google`;

const AUTH_TIMEOUT_MS = 180000;
const POPUP_WIDTH = 560;
const POPUP_HEIGHT = 720;
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return null;
  }
})();

const validateAuthResponse = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Kirish javobi noto'g'ri formatda.");
  }

  if (typeof payload.accessToken !== "string" || !payload.accessToken.trim()) {
    throw new Error("Kirish tokeni topilmadi.");
  }

  if (!payload.user || typeof payload.user !== "object") {
    throw new Error("Foydalanuvchi ma'lumoti topilmadi.");
  }

  return payload;
};

const parseAuthJsonPayload = (rawJson) => {
  const parsed = JSON.parse(rawJson);
  return validateAuthResponse(parsed);
};

const getCenteredPopupFeatures = () => {
  const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
  const dualScreenTop = window.screenTop ?? window.screenY ?? 0;
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth || screen.width;
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight || screen.height;

  const left = Math.max(0, Math.floor(viewportWidth / 2 - POPUP_WIDTH / 2 + dualScreenLeft));
  const top = Math.max(0, Math.floor(viewportHeight / 2 - POPUP_HEIGHT / 2 + dualScreenTop));

  return [
    `width=${POPUP_WIDTH}`,
    `height=${POPUP_HEIGHT}`,
    `left=${left}`,
    `top=${top}`,
    "menubar=no",
    "toolbar=no",
    "location=yes",
    "resizable=yes",
    "scrollbars=yes",
    "status=no",
  ].join(",");
};

const tryParseFromWindowBody = (popup) => {
  const rawText = popup.document?.body?.innerText?.trim();
  if (!rawText) return null;

  try {
    return parseAuthJsonPayload(rawText);
  } catch {
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) {
      return null;
    }

    const jsonCandidate = rawText.slice(firstBrace, lastBrace + 1);
    try {
      return parseAuthJsonPayload(jsonCandidate);
    } catch {
      return null;
    }
  }
};

export const loginWithGooglePopup = () =>
  new Promise((resolve, reject) => {
    let isSettled = false;

    const cleanup = (timer) => {
      window.clearInterval(timer);
      window.removeEventListener("message", onMessage);
    };

    const finishWithError = (timer, error) => {
      if (isSettled) return;
      isSettled = true;
      cleanup(timer);
      reject(error);
    };

    const finishWithSuccess = (timer, payload, popupWindow) => {
      if (isSettled) return;
      isSettled = true;
      cleanup(timer);
      popupWindow?.close();
      resolve(payload);
    };

    const onMessage = (event) => {
      if (API_ORIGIN && event.origin !== API_ORIGIN) {
        return;
      }

      const candidate = event?.data?.payload ?? event?.data;
      if (!candidate || typeof candidate !== "object") {
        return;
      }

      try {
        const payload = validateAuthResponse(candidate);
        finishWithSuccess(timer, payload, popup);
      } catch {
        // Ignore non-auth messages.
      }
    };

    const popup = window.open(
      GOOGLE_LOGIN_URL,
      "greenid-google-oauth",
      getCenteredPopupFeatures()
    );

    if (!popup) {
      finishWithError(
        -1,
        new Error("Brauzer popup oynani blokladi. Popup'ga ruxsat berib qayta urinib ko'ring.")
      );
      return;
    }

    window.addEventListener("message", onMessage);

    const startTime = Date.now();
    const timer = window.setInterval(() => {
      if (popup.closed) {
        finishWithError(timer, new Error("Kirish jarayoni tugamasdan oyna yopildi."));
        return;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed > AUTH_TIMEOUT_MS) {
        finishWithError(
          timer,
          new Error(
            "Avtomatik kirish yakunlanmadi. Backend callback front-end manziliga redirect qilishi kerak."
          )
        );
        popup.close();
        return;
      }

      try {
        const payload = tryParseFromWindowBody(popup);
        if (!payload) {
          return;
        }

        finishWithSuccess(timer, payload, popup);
      } catch {
        // Cross-origin popup during OAuth is expected until callback becomes accessible.
      }
    }, 700);
  });
