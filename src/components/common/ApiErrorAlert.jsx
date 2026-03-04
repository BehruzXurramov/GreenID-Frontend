import { toErrorMessage } from "../../utils/formatters";

export const ApiErrorAlert = ({ error }) => {
  if (!error) return null;

  return (
    <div className="alert alert--error" role="alert">
      {toErrorMessage(error)}
    </div>
  );
};
