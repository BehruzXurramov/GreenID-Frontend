const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const MAX_IMAGE_SIZE_BYTES = 32 * 1024 * 1024;

export const uploadImageToImgBB = async (file, apiKey) => {
  if (!apiKey) {
    throw new Error("ImgBB API kaliti topilmadi. .env faylini tekshiring.");
  }

  if (!file) {
    throw new Error("Yuklash uchun rasm fayli topilmadi.");
  }

  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Faqat rasm fayllarini yuklash mumkin.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Rasm hajmi 32MB dan oshmasligi kerak.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error("Rasmni ImgBB ga yuklab bo'lmadi. Qayta urinib ko'ring.");
  }

  const imageUrl = data?.data?.url;
  if (!imageUrl) {
    throw new Error("ImgBB javobidan rasm havolasi olinmadi.");
  }

  return imageUrl;
};
