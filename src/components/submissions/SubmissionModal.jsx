import { useEffect, useMemo, useRef, useState } from "react";
import { uploadImageToImgBB } from "../../api/imgbbApi";
import { ApiErrorAlert } from "../common/ApiErrorAlert";

const emptyForm = {
  description: "",
};
const MAX_IMAGE_SIZE_BYTES = 32 * 1024 * 1024;

const getFileValidationError = (file, label) => {
  if (!file) {
    return `${label}ni tanlang.`;
  }

  if (!file.type || !file.type.startsWith("image/")) {
    return `${label} faqat rasm fayli bo'lishi kerak.`;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `${label} hajmi 32MB dan oshmasligi kerak.`;
  }

  return "";
};

export const SubmissionModal = ({ open, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(emptyForm);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  const isSubmitting = useMemo(() => loading || uploading, [loading, uploading]);

  const resetFormState = () => {
    setForm(emptyForm);
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview("");
    setAfterPreview("");
    setErrors({});
    setSubmitError(null);

    if (beforeInputRef.current) beforeInputRef.current.value = "";
    if (afterInputRef.current) afterInputRef.current.value = "";
  };

  useEffect(() => {
    if (!open) {
      resetFormState();
      return;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (beforePreview) URL.revokeObjectURL(beforePreview);
    };
  }, [beforePreview]);

  useEffect(() => {
    return () => {
      if (afterPreview) URL.revokeObjectURL(afterPreview);
    };
  }, [afterPreview]);

  const validate = () => {
    const nextErrors = {};

    const beforeFileError = getFileValidationError(beforeFile, "Oldin rasm");
    const afterFileError = getFileValidationError(afterFile, "Keyin rasm");

    if (beforeFileError) nextErrors.beforeImage = beforeFileError;
    if (afterFileError) nextErrors.afterImage = afterFileError;

    if (!form.description.trim()) {
      nextErrors.description = "Tavsif majburiy.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (type, event) => {
    const nextFile = event.target.files?.[0] || null;
    if (!nextFile) return;

    const label = type === "before" ? "Oldin rasm" : "Keyin rasm";
    const fileError = getFileValidationError(nextFile, label);
    if (fileError) {
      setErrors((prev) => ({
        ...prev,
        [type === "before" ? "beforeImage" : "afterImage"]: fileError,
      }));
      event.target.value = "";
      return;
    }

    setSubmitError(null);
    setErrors((prev) => ({
      ...prev,
      [type === "before" ? "beforeImage" : "afterImage"]: undefined,
    }));

    const nextPreviewUrl = URL.createObjectURL(nextFile);
    if (type === "before") {
      setBeforeFile(nextFile);
      setBeforePreview(nextPreviewUrl);
    } else {
      setAfterFile(nextFile);
      setAfterPreview(nextPreviewUrl);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      setUploading(true);
      const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;

      const [beforeImageUrl, afterImageUrl] = await Promise.all([
        uploadImageToImgBB(beforeFile, imgbbApiKey),
        uploadImageToImgBB(afterFile, imgbbApiKey),
      ]);

      await onSubmit({
        beforeImage: beforeImageUrl,
        afterImage: afterImageUrl,
        description: form.description.trim(),
      });
      resetFormState();
    } catch (error) {
      setSubmitError(error);
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__header">
          <h2>Tozalash yuborish</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Yopish">
            ×
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label>
            Oldin rasm
            <input
              ref={beforeInputRef}
              className="modal__file-input"
              type="file"
              accept="image/*"
              onChange={(event) => handleFileChange("before", event)}
            />
            <span className="modal__file-help">Faqat rasm, maksimal 32MB.</span>
            {errors.beforeImage && <span className="field-error">{errors.beforeImage}</span>}
          </label>

          <label>
            Keyin rasm
            <input
              ref={afterInputRef}
              className="modal__file-input"
              type="file"
              accept="image/*"
              onChange={(event) => handleFileChange("after", event)}
            />
            <span className="modal__file-help">Faqat rasm, maksimal 32MB.</span>
            {errors.afterImage && <span className="field-error">{errors.afterImage}</span>}
          </label>

          <div className="modal__preview-grid">
            <div className="modal__preview-card">
              <h3>Oldin rasm preview</h3>
              {beforePreview ? (
                <img src={beforePreview} alt="Oldin rasm preview" />
              ) : (
                <p>Rasm tanlanmagan</p>
              )}
            </div>
            <div className="modal__preview-card">
              <h3>Keyin rasm preview</h3>
              {afterPreview ? (
                <img src={afterPreview} alt="Keyin rasm preview" />
              ) : (
                <p>Rasm tanlanmagan</p>
              )}
            </div>
          </div>

          <label>
            Tavsif
            <textarea
              name="description"
              rows={4}
              maxLength={3000}
              placeholder="Nima tozalangani, qayerdaligi va natijasini yozing."
              value={form.description}
              onChange={handleChange}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </label>

          <ApiErrorAlert error={submitError} />

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={isSubmitting}>
              Bekor qilish
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
