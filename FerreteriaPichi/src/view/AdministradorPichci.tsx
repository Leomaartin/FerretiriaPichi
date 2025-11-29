// AdminMenu.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/AdminMenu.css"; // Opcional, para estilos
import Navbar from "../components/Navbar";

const AdminMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="admin-menu-container">
      <header>
        <Navbar />
      </header>
      <h1 className="h1admin">Panel de Administración</h1>
      <div className="admin-menu-buttons">
        <button onClick={() => navigate("/adminproductos")}>
          Administrar Productos
        </button>
        <button onClick={() => navigate("/admincategorias")}>
          Administrar Categorías
        </button>
        <button onClick={() => navigate("/")}>Volver al Home</button>
      </div>
    </main>
  );
};

export default AdminMenu;
