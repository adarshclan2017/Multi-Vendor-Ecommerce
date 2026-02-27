import { useNavigate } from "react-router-dom";

function Logout({ className = "" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <button className={className} onClick={handleLogout}>
      <i className="fa-solid fa-right-from-bracket"></i>
      <span style={{ marginLeft: "6px" }}>Logout</span>
    </button>
  );
}

export default Logout;
