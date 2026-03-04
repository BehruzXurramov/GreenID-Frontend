import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllSubmissions, updateSubmissionAdmin } from "../api/submissionsApi";
import { getUsers } from "../api/usersApi";
import { useAuth } from "../hooks/useAuth";
import { AppShellLayout } from "../layouts/AppShellLayout";
import { ApiErrorAlert } from "../components/common/ApiErrorAlert";
import { Loader } from "../components/common/Loader";
import { EmptyState } from "../components/common/EmptyState";
import { AdminSubmissionCard } from "../components/admin/AdminSubmissionCard";
import { UsersTable } from "../components/admin/UsersTable";

export const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("submissions");
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSubmissions = async () => {
    setError(null);
    setSubmissionsLoading(true);

    try {
      const data = await getAllSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (loadError) {
      if (loadError.status === 403) {
        navigate("/access-denied", { replace: true });
        return;
      }

      setError(loadError);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const loadUsers = async () => {
    setError(null);
    setUsersLoading(true);

    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (loadError) {
      if (loadError.status === 403) {
        navigate("/access-denied", { replace: true });
        return;
      }

      setError(loadError);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeSection === "users" && users.length === 0 && !usersLoading) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleSaveSubmission = async (submissionId, payload) => {
    const updated = await updateSubmissionAdmin(submissionId, payload);

    setSubmissions((prev) =>
      prev.map((item) => (item.id === submissionId ? { ...item, ...updated } : item))
    );

    if (updated?.user) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === updated.user.id ? { ...item, points: updated.user.points } : item
        )
      );
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

        <nav className="side-nav">
          <button
            type="button"
            className={`btn ${activeSection === "submissions" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveSection("submissions")}
          >
            Yuborishlar
          </button>
          <button
            type="button"
            className={`btn ${activeSection === "users" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveSection("users")}
          >
            Foydalanuvchilar
          </button>
          <Link className="btn btn--ghost" to="/dashboard">
            Boshqaruv paneliga qaytish
          </Link>
          <button
            type="button"
            className="btn btn--text"
            onClick={() => logout({ redirectToHome: true })}
          >
            Chiqish
          </button>
        </nav>
      </div>
    ),
    [user, activeSection, logout]
  );

  return (
    <AppShellLayout title="Admin paneli" sidebar={sidebar}>
      <section className="page-head">
        <h2>{activeSection === "submissions" ? "Barcha yuborishlar" : "Foydalanuvchilar"}</h2>
        <p>
          {activeSection === "submissions"
            ? "Dalillarni ko‘rib chiqing, ball bering va izoh qoldiring."
            : "Platformadagi foydalanuvchilar, rollar va jamlangan ballarni kuzating."}
        </p>
      </section>

      <ApiErrorAlert error={error} />

      {activeSection === "submissions" ? (
        submissionsLoading ? (
          <Loader text="Yuborishlar yuklanmoqda..." />
        ) : submissions.length === 0 ? (
          <EmptyState title="Yuborishlar topilmadi" description="Hozircha tekshirish uchun ma'lumot yo‘q." />
        ) : (
          <div className="cards-grid">
            {submissions.map((submission) => (
              <AdminSubmissionCard
                key={submission.id}
                submission={submission}
                onSave={handleSaveSubmission}
              />
            ))}
          </div>
        )
      ) : usersLoading ? (
        <Loader text="Foydalanuvchilar yuklanmoqda..." />
      ) : users.length === 0 ? (
        <EmptyState title="Foydalanuvchi topilmadi" description="Foydalanuvchilar jadvali shu yerda chiqadi." />
      ) : (
        <UsersTable users={users} />
      )}
    </AppShellLayout>
  );
};
