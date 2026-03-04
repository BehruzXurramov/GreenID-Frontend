export const toErrorMessage = (error) => {
  if (!error) return "";
  if (typeof error === "string") return error;

  if (Array.isArray(error?.message)) {
    return error.message.join(", ");
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.";
};

export const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
