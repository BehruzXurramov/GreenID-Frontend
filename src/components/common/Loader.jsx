export const Loader = ({ text = "Yuklanmoqda..." }) => {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader" />
      <p>{text}</p>
    </div>
  );
};
