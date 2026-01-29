import React, { useState } from "react";
import "./Register.css";
import { registeruser } from "../../api/authapi";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});

    const handlechange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name || formData.name.length < 3) {
            newErrors.name = "Name must be at least 3 characters";
        }

        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.role) {
            newErrors.role = "Please select a role";
        }

        if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        return newErrors;
    };

    const handlesubmit = async (e) => {
        e.preventDefault();
        console.log("REGISTER BUTTON CLICKED");


        const validationError = validate();
        setErrors(validationError);

        // ✅ FIXED CONDITION
        if (Object.keys(validationError).length !== 0) return;

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };

            const res = await registeruser(payload);
            console.log("Backend response:", res.data);
            alert("Registration successful");
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }

    };


    return (
        <div className="register">
            <div className="row justify-content-center">
                <div className="card shadow p-4">
                    <h3 className="text-center mb-4">Register</h3>

                    <form onSubmit={handlesubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handlechange}
                            />
                            {errors.name && <p className="error">{errors.name}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handlechange}
                            />
                            {errors.email && <p className="error">{errors.email}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Register As</label>
                            <select
                                className="form-select"
                                name="role"
                                value={formData.role}
                                onChange={handlechange}
                            >
                                <option value="">Select Role</option>
                                <option value="user">User</option>
                                <option value="seller">Seller</option>
                            </select>
                            {errors.role && <p className="error">{errors.role}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={formData.password}
                                onChange={handlechange}
                            />
                            {errors.password && <p className="error">{errors.password}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handlechange}
                            />
                            {errors.confirmPassword && (
                                <p className="error">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
