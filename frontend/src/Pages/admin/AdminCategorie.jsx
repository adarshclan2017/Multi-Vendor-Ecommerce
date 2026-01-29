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
  const [editing, setEditing] = useState(null); // { _id, name, status }
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.log("❌ load categories error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...categories].sort((a, b) => {
      // active first
      if (a.status === b.status) return 0;
      return a.status === "active" ? -1 : 1;
    });
  }, [categories]);

  const addCategory = async () => {
    if (!name.trim()) return alert("Enter category name");
    try {
      setAdding(true);
      await createAdminCategory({ name });
      setName("");
      load();
    } catch (err) {
      console.log("❌ add category error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteAdminCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log("❌ delete category error:", err.response?.data || err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleStatus = async (cat) => {
    const next = cat.status === "active" ? "inactive" : "active";
    try {
      // optimistic UI
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, status: next } : c))
      );
      await updateAdminCategory(cat._id, { status: next });
    } catch (err) {
      console.log("❌ toggle status error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update status");
      load(); // revert
    }
  };

  const openEdit = (cat) => {
    setEditing({ _id: cat._id, name: cat.name, status: cat.status });
  };

  const saveEdit = async () => {
    if (!editing?.name?.trim()) return alert("Name required");
    try {
      setSavingEdit(true);
      await updateAdminCategory(editing._id, {
        name: editing.name,
        status: editing.status,
      });
      setEditing(null);
      load();
    } catch (err) {
      console.log("❌ edit save error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update category");
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
                      <button
                        className="ac-actionBtn"
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </button>

                      <button
                        className={`ac-actionBtn ${
                          c.status === "active" ? "warn" : "ok"
                        }`}
                        onClick={() => toggleStatus(c)}
                      >
                        {c.status === "active" ? "Disable" : "Enable"}
                      </button>

                      <button
                        className="ac-actionBtn danger"
                        onClick={() => remove(c._id)}
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
    </div>
  );
}
