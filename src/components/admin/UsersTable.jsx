import { formatDateTime } from "../../utils/formatters";

export const UsersTable = ({ users }) => {
  return (
    <div className="table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th>Ism</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Ball</th>
            <th>Yaratilgan sana</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-pill role-pill--${user.role}`}>
                  {user.role === "admin" ? "Admin" : "Foydalanuvchi"}
                </span>
              </td>
              <td>{user.points}</td>
              <td>{formatDateTime(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
