import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminCategorie.css";
import {
  getAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
} from "../../api/adminCategoryApi";

export default function AdminCategorie() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  // edit modal state
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // ✅ messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ delete confirm modal
  const [confirmDel, setConfirmDel] = useState(null); // { _id, name }
  const [deleting, setDeleting] = useState(false);

  const flashSuccess = (text, ms = 2500) => {
    setSuccess(text);
    setTimeout(() => setSuccess(""), ms);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.log("❌ load categories error:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...categories].sort((a, b) =>
      a.status === b.status ? 0 : a.status === "active" ? -1 : 1
    );
  }, [categories]);

  const addCategory = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");
      await createAdminCategory({ name });
      setName("");
      flashSuccess("Category added ✅");
      load();
    } catch (err) {
      console.log("❌ add category error:", err);
      setError(err.response?.data?.message || "Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  // ✅ open custom confirm modal
  const remove = (cat) => {
    setError("");
    setSuccess("");
    setConfirmDel({ _id: cat._id, name: cat.name });
  };

  // ✅ confirm delete action
  const confirmDelete = async () => {
    if (!confirmDel?._id) return;

    try {
      setDeleting(true);
      setError("");
      await deleteAdminCategory(confirmDel._id);

      setCategories((prev) => prev.filter((c) => c._id !== confirmDel._id));
      setConfirmDel(null);
      flashSuccess("Category deleted ✅");
    } catch (err) {
      console.log("❌ delete category error:", err);
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (cat) => {
    const next = cat.status === "active" ? "inactive" : "active";

    try {
      setError("");
      setSuccess("");
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, status: next } : c))
      );
      await updateAdminCategory(cat._id, { status: next });
      flashSuccess(`Category ${next === "active" ? "enabled" : "disabled"} ✅`);
    } catch (err) {
      console.log("❌ toggle status error:", err);
      setError(err.response?.data?.message || "Failed to update status");
      load();
    }
  };

  const openEdit = (cat) => {
    setEditing({ _id: cat._id, name: cat.name, status: cat.status });
    setError("");
    setSuccess("");
  };

  const saveEdit = async () => {
    if (!editing?.name?.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");
      setSuccess("");
      await updateAdminCategory(editing._id, {
        name: editing.name,
        status: editing.status,
      });
      setEditing(null);
      flashSuccess("Changes saved ✅");
      load();
    } catch (err) {
      console.log("❌ edit save error:", err);
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="ac-page">
      <div className="ac-head">
        <div>
          <h2 className="ac-title">Categories</h2>
          <p className="ac-sub">Add, edit and enable/disable categories</p>
        </div>
      </div>

      {/* ✅ Messages */}
      {error && <div className="ac-error">{error}</div>}
      {success && <div className="ac-success">{success}</div>}

      {/* Add category */}
      <div className="ac-add">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
        />
        <button onClick={addCategory} disabled={adding}>
          {adding ? "Adding..." : "+ Add"}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="ac-empty">Loading categories...</div>
      ) : sorted.length === 0 ? (
        <div className="ac-empty">No categories found.</div>
      ) : (
        <div className="ac-tableWrap">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((c) => (
                <tr key={c._id}>
                  <td className="ac-name">{c.name}</td>

                  <td>
                    <span
                      className={`ac-status ${
                        c.status === "inactive" ? "inactive" : "active"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <div className="ac-actions">
                      <button className="ac-actionBtn" onClick={() => openEdit(c)}>
                        Edit
                      </button>

                      <button
                        className={`ac-actionBtn ${c.status === "active" ? "warn" : "ok"}`}
                        onClick={() => toggleStatus(c)}
                      >
                        {c.status === "active" ? "Disable" : "Enable"}
                      </button>

                      <button
                        className="ac-actionBtn danger"
                        onClick={() => remove(c)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="ac-modalOverlay" onClick={() => setEditing(null)}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Category</h3>

            <div className="ac-modalField">
              <label>Name</label>
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="ac-modalField">
              <label>Status</label>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div className="ac-modalBtns">
              <button className="ac-actionBtn" onClick={() => setEditing(null)}>
                Cancel
              </button>

              <button className="ac-save" onClick={saveEdit} disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirm Modal */}
      {confirmDel && (
        <div className="ac-modalOverlay" onClick={() => !deleting && setConfirmDel(null)}>
          <div className="ac-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="ac-confirm-title">Delete Category?</h3>
            <p className="ac-confirm-text">
              Are you sure you want to delete <b>{confirmDel.name}</b>?
            </p>

            <div className="ac-confirmBtns">
              <button
                className="ac-actionBtn"
                onClick={() => setConfirmDel(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="ac-actionBtn danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
