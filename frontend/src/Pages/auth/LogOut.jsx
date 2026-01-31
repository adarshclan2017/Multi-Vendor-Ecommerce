import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <button onClick={handleLogout}>
      <i className="fa-solid fa-right-from-bracket"></i> Logout
    </button>
  );
}

export default Logout;
