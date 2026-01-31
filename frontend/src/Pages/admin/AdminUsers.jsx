import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminUsers.css";
import { getAdminUsers, updateAdminUser } from "../../api/adminApi";

const badge = (role) => {
  const r = String(role || "user").toLowerCase();
  if (r === "admin") return "au-badge admin";
  if (r === "seller") return "au-badge seller";
  return "au-badge user";
};

const stBadge = (st) => {
  const s = String(st || "active").toLowerCase();
  if (s === "blocked") return "au-badge blocked";
  return "au-badge active";
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers();
      setUsers(res.data?.users || []);
    } catch (err) {
      console.log("❌ admin users error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (users || [])
      .filter((u) => (roleFilter === "all" ? true : String(u.role).toLowerCase() === roleFilter))
      .filter((u) => (statusFilter === "all" ? true : String(u.status || "active").toLowerCase() === statusFilter))
      .filter((u) => {
        if (!query) return true;
        const name = String(u.name || "").toLowerCase();
        const email = String(u.email || "").toLowerCase();
        const id = String(u._id || "").toLowerCase();
        return name.includes(query) || email.includes(query) || id.includes(query);
      });
  }, [users, q, roleFilter, statusFilter]);

  const save = async (id, payload) => {
    try {
      setSavingId(id);
      const res = await updateAdminUser(id, payload);
      const updated = res.data?.user;

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? (updated ? updated : { ...u, ...payload }) : u))
      );
    } catch (err) {
      console.log("❌ update user error:", err.response?.data || err);
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="au-page">
      <div className="au-head">
        <div>
          <h2 className="au-title">Users</h2>
          <p className="au-sub">Search users, change role, block/unblock</p>
        </div>

        <button className="au-btn" onClick={loadUsers} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="au-controls">
        <div className="au-search">
          <span className="au-ico">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name / email / id"
          />
        </div>

        <div className="au-filter">
          <label>Role</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="au-filter">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="au-empty">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="au-empty">No users found.</div>
      ) : (
        <div className="au-tableWrap">
          <table className="au-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Update Role</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => {
                const role = String(u.role || "user").toLowerCase();
                const status = String(u.status || "active").toLowerCase();

                return (
                  <tr key={u._id}>
                    <td>
                      <div className="au-user">{u.name || "—"}</div>
                      <div className="au-muted">{u.email || "—"}</div>
                      <div className="au-mono au-muted">{u._id}</div>
                    </td>

                    <td><span className={badge(role)}>{role}</span></td>

                    <td><span className={stBadge(status)}>{status}</span></td>

                    <td>
                      <select
                        className="au-select"
                        value={role}
                        disabled={savingId === u._id}
                        onChange={(e) => save(u._id, { role: e.target.value })}
                      >
                        <option value="user">User</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <select
                        className="au-select"
                        value={status}
                        disabled={savingId === u._id}
                        onChange={(e) => save(u._id, { status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>

                      {savingId === u._id && <span className="au-saving">Saving…</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
