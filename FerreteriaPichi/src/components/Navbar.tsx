import React, { useState, useEffect } from "react";
import "../view/css/Navbar.css";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const parsed = JSON.parse(stored);

    // Normalizar foto del localStorage
    const fixedLocalFoto =
      parsed.foto?.startsWith("http")
        ? parsed.foto
        : `http://localhost:3334/${parsed.foto}`;

    setUser({
      ...parsed,
      foto: fixedLocalFoto
    });

    // Pedir usuario actualizado al backend
    fetch("http://localhost:3334/api/mostrarusuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.email })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const backendFoto =
            data.user.foto?.startsWith("http")
              ? data.user.foto // foto externa completa
              : `http://localhost:3334/${data.user.foto}`; // foto local subida

          const fixedUser = {
            nombre: data.user.nombre,
            email: data.user.email,
            foto: backendFoto
          };

          setUser(fixedUser);
          localStorage.setItem("user", JSON.stringify(fixedUser));
        }
      })
      .catch(err => console.error("Error obteniendo usuario:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

return (
  <nav className="navbar-container fixed-navbar">
    <div className="navbar">

      {/* LOGO + TÍTULO */}
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

      {/* BOTÓN MOBILE */}
      <button
        className="menu-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* CONTENEDOR DE LINKS */}
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

        {/* SI EL USUARIO ESTÁ LOGUEADO */}
        {user ? (
          <div className="navbar-session">

            {/* Foto + Nombre */}
            <div className="navbar-user">
              <img
                src={user.foto}
                alt={user.nombre}
                className="navbar-user-pic"
              />
              <span className="navbar-username">{user.nombre}</span>
            </div>

            {/* BOTÓN ADMIN SOLO PARA VOS */}
            {user.email === "leomartin9808@gmail.com" && (
              <a
                href="/adminvista"
                className="navbar-admin-btn"
                style={{
                  marginLeft: "10px",
                  padding: "6px 12px",
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "6px",
                  fontWeight: "600",
                  textDecoration: "none"
                }}
              >
                Admin
              </a>
            )}

            {/* Botón Cerrar Sesión */}
            <button className="navbar-logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>

            {/* Ícono Carrito */}
            <a href="/carrito" className="navbar-cart-link" title="Carrito">
              <i className="fa-solid fa-cart-shopping cart-icon"></i>
            </a>
          </div>
        ) : (
          /* SI NO ESTÁ LOGUEADO */
          <div
            className="navbar-session"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <a href="/login" className="navbar-login-btn" style={{ color: "black" }}>
              Iniciar Sesión
            </a>

            {/* Carrito visible incluso sin login */}
            <a href="/carrito" className="navbar-cart-link" title="Carrito">
              <i className="fa-solid fa-cart-shopping cart-icon"></i>
            </a>
          </div>
        )}
      </div>
    </div>
  </nav>
);

};

export default Navbar;
