import React, { useState, useEffect } from "react";
import "../view/css/Navbar.css"; // Asegúrate de que esta ruta sea correcta

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Traer usuario del localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // Redirige al home
  };

  return (
    // Contenedor principal para fondo y posición fija
    <nav className="navbar-container fixed-navbar">
      <div className="navbar">
        {/* Logo y título con los colores y frase requeridos */}
        <div className="navbar-logo">
          <img
            src="http://localhost:3334/uploads/logo.png"
            className="logo-redondo"
          />
          <div className="navbar-title-container">
            <h1 className="navbar-title" style={{ color: "#A3E635" }}>
              Ferretería Casa Mario
            </h1>
            <i className="navbar-subtitle">De Christian Landi</i>
          </div>
        </div>
        {/* Botón menú mobile */}
        <button
          className="menu-toggle"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Contenedor principal de enlaces y sesión */}
        <div className={`navbar-links-container ${isOpen ? "open" : ""}`}>
          <ul className="navbar-links">
            <li>
              <a href="/" onClick={() => setIsOpen(false)}>
                Inicio
              </a>
            </li>
            <li>
              <a href="/sobrenosotros" onClick={() => setIsOpen(false)}>
                Contacto
              </a>
            </li>
          </ul>

          {/* Estado de sesión */}
          {user ? (
            <div className="navbar-session">
              <div className="navbar-user">
                {/* Imagen de usuario */}
                <img
                  src={user.picture || "/default-user.png"}
                  alt={user.name}
                  className="navbar-user-pic"
                />
                <span className="navbar-username">{user.name}</span>
              </div>
              <button
                className="navbar-logout-btn" // Clase simple para CSS
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="navbar-login-btn"
              style={{ color: "black" }}
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
