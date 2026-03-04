import { StatusBadge } from "../common/StatusBadge";
import { formatDateTime } from "../../utils/formatters";

export const SubmissionCard = ({ submission, showUser = false, children }) => {
  return (
    <article className="submission-card">
      <header className="submission-card__header">
        <div className="submission-card__meta">
          <StatusBadge status={submission.status} />
          <span className="submission-card__date">
            Yuborilgan sana: {formatDateTime(submission.createdAt)}
          </span>
        </div>
        {submission.pointsGiven !== null && (
          <div className="submission-card__points">{submission.pointsGiven} ball</div>
        )}
      </header>

      {showUser && submission.user && (
        <div className="submission-card__user">
          <strong>{submission.user.name}</strong>
          <span>{submission.user.email}</span>
        </div>
      )}

      <div className="submission-card__images">
        <figure>
          <img src={submission.beforeImage} alt="Tozalashdan oldin" loading="lazy" />
          <figcaption>Oldin</figcaption>
        </figure>
        <figure>
          <img src={submission.afterImage} alt="Tozalashdan keyin" loading="lazy" />
          <figcaption>Keyin</figcaption>
        </figure>
      </div>

      <div className="submission-card__content">
        <h3>Tavsif</h3>
        <p>{submission.description}</p>
      </div>

      {submission.adminDescription && (
        <div className="submission-card__feedback">
          <h4>Admin izohi</h4>
          <p>{submission.adminDescription}</p>
        </div>
      )}

      {children}
    </article>
  );
};
