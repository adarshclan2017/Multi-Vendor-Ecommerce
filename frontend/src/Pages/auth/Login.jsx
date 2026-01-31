import React, { useState } from "react";
import styles from "./Login.module.css";
import { loginuser } from "../../api/authapi";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formdata, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formdata.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formdata.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formdata.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    setErrors(validationError);
    if (Object.keys(validationError).length !== 0) return;

    try {
      const res = await loginuser(formdata);

      const token = res.data?.token;

      const user =
        res.data?.user ||
        (res.data?._id
          ? {
              _id: res.data._id,
              name: res.data.name,
              email: res.data.email,
              role: res.data.role,
            }
          : null);

      if (!token) {
        return setErrors({ message: res.data?.message || "token not found" });
      }

      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      const role = user?.role || res.data?.role;
      if (role === "admin") return navigate("/admin", { replace: true });
      if (role === "seller") return navigate("/seller", { replace: true });
      return navigate("/", { replace: true });
    } catch (err) {
      setErrors({ message: err.response?.data?.message || "Login failed" });
    }
  };

  return (
    <div className={styles.Login}>
      <div className={styles.wrap}>
        <div className={`${styles.card} shadow`}>
          <h3 className="text-center mb-4">LOGIN</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter email"
                value={formdata.email}
                onChange={handleChange}
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter password"
                value={formdata.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className={styles.error}>{errors.password}</p>
              )}
            </div>

            {errors.message && (
              <p className={`${styles.error} text-danger`}>{errors.message}</p>
            )}

            <button type="submit" className="btn btn-primary w-50 mx-auto d-block">
              Login
            </button>

            <p className="text-center mt-3 mb-0">
              Don&apos;t have an account?{" "}
              <Link to="/reg" className="fw-bold text-decoration-none">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
