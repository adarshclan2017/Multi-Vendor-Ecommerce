import React, { useState } from "react";
import "../../styles/AdminAddCategorie.css";

function AdminAddCategorie() {
    const [categoryName, setCategoryName] = useState("");
    const [status, setStatus] = useState("Active");

    const handleSubmit = (e) => {
        e.preventDefault();

        const categoryData = {
            categoryName,
            status,
        };

        console.log("Category Added:", categoryData);

        // reset
        setCategoryName("");
        setStatus("Active");
    };

    return (
        <div className="add-category-container">
            <h2>Add New Category</h2>

            <form className="add-category-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Category Name</label>
                    <input
                        type="text"
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save">
                        Save Category
                    </button>
                    <button type="reset" className="btn-cancel">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminAddCategorie;
