import React, { useState } from "react";
import "../../styles/AdminViewUser.css";

function AdminViewUser() {
  const [user, setUser] = useState({
    id: "12345",
    name: "John Doe",
    email: "johndoe@example.com",
    role: "User",
    status: "Active",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated User:", user);
    // Send data to backend API here
  };

  return (
    <div className="update-user-container">
      <h2>Update User</h2>

      <form className="update-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User ID</label>
          <input type="text" name="id" value={user.id} readOnly />
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={user.role} onChange={handleChange}>
              <option>User</option>
              <option>Admin</option>
              <option>Seller</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={user.status} onChange={handleChange}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-update">
            Update User
          </button>
          <button type="reset" className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminViewUser;
