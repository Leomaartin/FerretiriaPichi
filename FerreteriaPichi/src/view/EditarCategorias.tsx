import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/EditarCategoria.css";
import Navbar from "../components/Navbar";
import notify from "../utils/toastNotifier";
import { useConfirm } from "../components/ConfirmModal/ConfirmContext";
import API_URL from "../config/api";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm } = useConfirm();

  // Traer categorías
  const fetchCategorias = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categoria`);
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
    if (!form.nombre || !form.nombre.trim()) {
      notify.error("Campo requerido", "El nombre de la categoría es obligatorio.");
      return;
    }

    const nombreCat = form.nombre.trim();

    try {
      const formData = new FormData();
      formData.append("nombre", nombreCat);
      if (form.imagenFile) formData.append("imagen", form.imagenFile);
      else if (form.imagen) formData.append("imagen", form.imagen);

      if (editingId) {
        const confirmed = await confirm({
          title: "¿Guardar modificaciones?",
          message: "¿Estás seguro de que querés actualizar esta categoría con los nuevos datos?",
          itemName: nombreCat,
          confirmText: "Sí, actualizar",
          cancelText: "Cancelar",
          type: "info",
        });
        if (!confirmed) return;

        await axios.put(
          `${API_URL}/api/categoria/${editingId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        notify.categoryUpdated(nombreCat);
      } else {
        await axios.post(`${API_URL}/api/categoria`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notify.categoryCreated(nombreCat);
      }

      setForm({});
      setEditingId(null);
      setIsModalOpen(false);
      fetchCategorias();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      notify.error("Error al guardar", "No se pudo guardar la categoría.");
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setForm(categoria);
    setEditingId(categoria.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const cat = categorias.find((c) => c.id === id);
    const nombreCat = cat ? cat.nombre : `Categoría #${id}`;

    const confirmed = await confirm({
      title: "¿Eliminar Categoría?",
      message: "¿Estás seguro de que querés eliminar esta categoría? Esta acción no se puede deshacer.",
      itemName: nombreCat,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/categoria/${id}`);
      notify.categoryDeleted(nombreCat);
      fetchCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      notify.error("Error al eliminar", "No se pudo eliminar la categoría.");
    }
  };

  return (
    <main
      style={{marginTop:"8%"}}
    >
   
        <Navbar />
     
      <div className="superusuario-container">
        <div className="header-admin">
          <h1>Gestión de Categorías</h1>
          <button 
            className="btn-nuevo"
            onClick={() => {
              setForm({});
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            + Nueva Categoría
          </button>
        </div>

        {/* Formulario Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? "Editar Categoría" : "Agregar Categoría"}</h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
              </div>

              <div className="form-container modal-body">
                <h3>Nombre</h3>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre de la categoría"
                  value={form.nombre || ""}
                  onChange={handleChange}
                />
                
                <h3>Imagen de la Categoría</h3>
                <input className="file-input-modern" type="file" name="imagen" onChange={handleChange} />

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button
                    onClick={handleSubmit}
                    className="btn-save"
                    style={{ backgroundColor: "#a3e635", color: "white" }}
                  >
                    {editingId ? "Actualizar" : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                      src={`${API_URL}/uploads/${c.imagen}`}
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
