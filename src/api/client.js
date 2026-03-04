import { STORAGE_KEYS } from "../constants/storageKeys";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://bestapi.uz/greenid";

let unauthorizedHandler = null;

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const parseJsonSafe = (raw) => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const resolveMessage = (status, data) => {
  if (status === 401) {
    return "Sessiya tugadi. Qayta kirish talab qilinadi.";
  }

  if (status === 403) {
    return "Sizda ushbu amal uchun ruxsat yo'q.";
  }

  if (status === 400) {
    return "Kiritilgan ma'lumotlarda xatolik bor. Maydonlarni tekshiring.";
  }

  if (status === 404) {
    return "So'ralgan ma'lumot topilmadi.";
  }

  if (status >= 500) {
    return "Serverda vaqtinchalik xatolik yuz berdi. Keyinroq qayta urinib ko'ring.";
  }

  if (data && typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return "So'rovni bajarib bo'lmadi.";
};

const withAuthHeader = (headers, auth) => {
  const next = { ...headers };

  if (auth) {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    if (token) {
      next.Authorization = `Bearer ${token}`;
    }
  }

  return next;
};

const hasBody = (method, body) => {
  if (!body) return false;
  return method !== "GET" && method !== "HEAD";
};

export const apiRequest = async (path, options = {}) => {
  const {
    auth = true,
    method = "GET",
    headers = {},
    body,
    signal,
    ...rest
  } = options;

  const requestHeaders = withAuthHeader(headers, auth);
  const upperMethod = method.toUpperCase();
  const requestConfig = {
    method: upperMethod,
    headers: requestHeaders,
    signal,
    ...rest,
  };

  if (hasBody(upperMethod, body)) {
    if (body instanceof FormData) {
      requestConfig.body = body;
    } else if (typeof body === "string") {
      requestConfig.body = body;
      requestConfig.headers = {
        "Content-Type": "application/json",
        ...requestConfig.headers,
      };
    } else {
      requestConfig.body = JSON.stringify(body);
      requestConfig.headers = {
        "Content-Type": "application/json",
        ...requestConfig.headers,
      };
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestConfig);
  const raw = await response.text();
  const data = parseJsonSafe(raw);

  if (!response.ok) {
    if (response.status === 401 && typeof unauthorizedHandler === "function") {
      unauthorizedHandler();
    }

    throw new ApiError(response.status, resolveMessage(response.status, data), data);
  }

  return data;
};
