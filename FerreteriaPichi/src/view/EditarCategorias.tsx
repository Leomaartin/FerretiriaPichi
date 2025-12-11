import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/EditarCategoria.css";
import Navbar from "../components/Navbar";

interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
}

const SuperUsuarioCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Partial<Categoria> & { imagenFile?: File }>(
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);

  // Traer categorías
  const fetchCategorias = async () => {
    try {
      const res = await axios.get("http://localhost:3334/api/categoria");
      setCategorias(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategorias([]);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      setForm({ ...form, imagenFile: file });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    if (!form.nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      if (form.imagenFile) formData.append("imagen", form.imagenFile);
      else if (form.imagen) formData.append("imagen", form.imagen);

      if (editingId) {
        await axios.put(
          `http://localhost:3334/api/categoria/${editingId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.post("http://localhost:3334/api/categoria", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setForm({});
      setEditingId(null);
      fetchCategorias();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setForm(categoria);
    setEditingId(categoria.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
    try {
      await axios.delete(`http://localhost:3334/api/categoria/${id}`);
      fetchCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  return (
    <main
      style={{marginTop:"8%"}}
    >
   
        <Navbar />
     
      <div className="superusuario-container">
        <h1>Gestión de Categorías</h1>

        {/* Formulario */}
        <div className="form-container">
          <h2>{editingId ? "Editar Categoría" : "Agregar Categoría"}</h2>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre || ""}
            onChange={handleChange}
          />
          <input type="file" name="imagen" onChange={handleChange} />
          <button
            onClick={handleSubmit}
            style={{ backgroundColor: "#a3e635", color: "white" }}
          >
            {editingId ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <table
        className="categorias-table"
        style={{ width: "50%", marginLeft: "25%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.length > 0 ? (
            categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td>
                  {c.imagen && (
                    <img
                      src={`http://localhost:3334/uploads/${c.imagen}`}
                      alt={c.nombre}
                      className="categoria-img"
                    />
                  )}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(c)}
                    style={{ backgroundColor: "#a3e635", color: "white" }}
                  >
                    Cambiar
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(c.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No hay categorías
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
};

export default SuperUsuarioCategorias;
