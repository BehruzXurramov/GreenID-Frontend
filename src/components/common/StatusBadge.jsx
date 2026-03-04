const LABELS = {
  pending: "Ko'rib chiqilmoqda",
  approved: "Tasdiqlangan",
};

export const StatusBadge = ({ status }) => {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {LABELS[status] || status}
    </span>
  );
};
