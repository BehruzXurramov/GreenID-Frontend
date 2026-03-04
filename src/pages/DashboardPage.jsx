import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShellLayout } from "../layouts/AppShellLayout";
import { SubmissionCard } from "../components/submissions/SubmissionCard";
import { SubmissionModal } from "../components/submissions/SubmissionModal";
import { ApiErrorAlert } from "../components/common/ApiErrorAlert";
import { Loader } from "../components/common/Loader";
import { EmptyState } from "../components/common/EmptyState";
import { createSubmission, getMySubmissions } from "../api/submissionsApi";
import { useAuth } from "../hooks/useAuth";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSubmissions = async () => {
    setError(null);
    try {
      const data = await getMySubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (loadError) {
      if (loadError.status === 403) {
        navigate("/access-denied", { replace: true });
        return;
      }

      setError(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSubmission = async (payload) => {
    setSubmitting(true);
    try {
      await createSubmission(payload);
      setModalOpen(false);
      await loadSubmissions();
    } finally {
      setSubmitting(false);
    }
  };

  const sidebar = useMemo(
    () => (
      <div className="sidebar-content">
        <div className="info-card">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div className="points-pill">{user?.points ?? 0} ball</div>
        </div>

        <div className="side-actions">
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            Tozalash yuborish
          </button>
          {user?.role === "admin" && (
            <Link className="btn btn--ghost" to="/admin">
              Admin paneli
            </Link>
          )}
          <button
            type="button"
            className="btn btn--text"
            onClick={() => logout({ redirectToHome: true })}
          >
            Chiqish
          </button>
        </div>
      </div>
    ),
    [user, logout]
  );

  return (
    <>
      <AppShellLayout title="Boshqaruv paneli" sidebar={sidebar}>
        <section className="page-head">
          <h2>Mening yuborishlarim</h2>
          <p>Ekologik tozalash hisobotlaringizni kuzating va holatini ko‘ring.</p>
        </section>

        <ApiErrorAlert error={error} />

        {loading ? (
          <Loader text="Yuborishlar yuklanmoqda..." />
        ) : submissions.length === 0 ? (
          <EmptyState
            title="Hozircha yuborishlar yo‘q"
            description="Birinchi tozalash hisobotini yuboring va hamjamiyatga hissa qo‘shing."
          />
        ) : (
          <div className="cards-grid">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </AppShellLayout>

      <SubmissionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateSubmission}
        loading={submitting}
      />
    </>
  );
};
