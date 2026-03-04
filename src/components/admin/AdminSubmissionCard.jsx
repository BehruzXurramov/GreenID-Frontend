import { useState } from "react";
import { ApiErrorAlert } from "../common/ApiErrorAlert";
import { SubmissionCard } from "../submissions/SubmissionCard";

export const AdminSubmissionCard = ({ submission, onSave }) => {
  const [pointsGiven, setPointsGiven] = useState(
    submission.pointsGiven === null ? "" : String(submission.pointsGiven)
  );
  const [adminDescription, setAdminDescription] = useState(
    submission.adminDescription || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (event) => {
    event.preventDefault();
    setError(null);

    const parsedPoints = Number(pointsGiven);
    if (!Number.isInteger(parsedPoints) || parsedPoints < 0) {
      setError("Ball 0 yoki undan katta butun son bo'lishi kerak.");
      return;
    }

    setSaving(true);
    try {
      await onSave(submission.id, {
        pointsGiven: parsedPoints,
        adminDescription: adminDescription.trim() || undefined,
      });
    } catch (saveError) {
      setError(saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubmissionCard submission={submission} showUser>
      <form className="admin-review-form" onSubmit={handleSave}>
        <div className="admin-review-form__fields">
          <label>
            Ball
            <input
              type="number"
              min={0}
              step={1}
              value={pointsGiven}
              onChange={(event) => setPointsGiven(event.target.value)}
              required
            />
          </label>

          <label>
            Admin izohi
            <textarea
              rows={3}
              maxLength={3000}
              value={adminDescription}
              onChange={(event) => setAdminDescription(event.target.value)}
              placeholder="Tekshiruv natijasi yoki izoh kiriting."
            />
          </label>
        </div>

        <ApiErrorAlert error={error} />

        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving
            ? "Saqlanmoqda..."
            : submission.status === "approved"
            ? "Tekshiruvni yangilash"
            : "Yuborishni tasdiqlash"}
        </button>
      </form>
    </SubmissionCard>
  );
};
