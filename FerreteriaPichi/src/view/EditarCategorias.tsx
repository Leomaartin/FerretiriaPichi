import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/EditarCategoria.css";
import Navbar from "../components/Navbar";
import notify from "../utils/toastNotifier";
import { useConfirm } from "../components/ConfirmModal/ConfirmContext";
import API_URL from "../config/api";
import { useNavigate } from "react-router-dom";

interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
}

interface ProductoRef {
  id: number;
  id_categoria: number;
}

const SuperUsuarioCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<ProductoRef[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<Partial<Categoria> & { imagenFile?: File }>(
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm } = useConfirm();
  const navigate = useNavigate();

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

  // Traer productos para calcular conteo por categoría
  const fetchProductos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/productos`);
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([]);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, []);

  // Bloquear scroll de la página de fondo cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

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
    const cantidadProductos = productos.filter((p) => p.id_categoria === id).length;

    const mensajeAdvertencia =
      cantidadProductos > 0
        ? `Esta categoría contiene ${cantidadProductos} producto(s). ¿Estás seguro de que querés eliminarla? Esta acción no se puede deshacer.`
        : "¿Estás seguro de que querés eliminar esta categoría? Esta acción no se puede deshacer.";

    const confirmed = await confirm({
      title: "¿Eliminar Categoría?",
      message: mensajeAdvertencia,
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
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      notify.error("Error al eliminar", "No se pudo eliminar la categoría.");
    }
  };

  const categoriasFiltradas = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <main style={{ marginTop: "8%" }}>
      <Navbar />

      <div className="superusuario-container">
        <div className="header-admin">
          <div>
            <h1>Gestión de Categorías</h1>
            <p className="admin-section-subtitle">
              Administrá las categorías y controlá la cantidad de productos por rubro
            </p>
          </div>
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

        {/* Panel de estadísticas rápidas */}
        <div className="admin-cat-stats-bar">
          <div className="cat-stat-card">
            <span className="cat-stat-label">Total de Categorías</span>
            <span className="cat-stat-value">{categorias.length}</span>
          </div>
          <div className="cat-stat-card">
            <span className="cat-stat-label">Total de Productos</span>
            <span className="cat-stat-value">{productos.length}</span>
          </div>
          <div className="cat-stat-card">
            <span className="cat-stat-label">Promedio de Productos / Cat.</span>
            <span className="cat-stat-value">
              {categorias.length > 0
                ? (productos.length / categorias.length).toFixed(1)
                : 0}
            </span>
          </div>
        </div>

        {/* Barra de Búsqueda de Categorías */}
        <div className="cat-search-toolbar">
          <div className="cat-search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar categoría por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cat-search-input"
            />
            {searchTerm && (
              <button
                className="btn-clear-search"
                onClick={() => setSearchTerm("")}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          <button
            className="btn-ir-productos"
            onClick={() => navigate("/adminproductos")}
          >
            Ir a Gestión de Productos →
          </button>
        </div>

        {/* Formulario Modal Amigable y Scrolleable */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div
              className="modal-content fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CABECERA FIJA */}
              <div className="modal-header">
                <div className="modal-header-title">
                  <div className="modal-icon-badge">
                    <i className={`fa-solid ${editingId ? "fa-pen-to-square" : "fa-folder-plus"}`}></i>
                  </div>
                  <div>
                    <h2>{editingId ? "Editar Categoría" : "Nueva Categoría"}</h2>
                    <p className="modal-subtitle">
                      {editingId
                        ? "Modificá el nombre o la imagen de la categoría"
                        : "Ingresá los datos para registrar la categoría"}
                    </p>
                  </div>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                  title="Cerrar ventana"
                  type="button"
                >
                  ✕
                </button>
              </div>

              {/* CUERPO DEL MODAL CON SCROLL FLUIDO */}
              <div className="modal-body-scrollable">
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fa-solid fa-tag form-label-icon"></i> Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-input"
                    placeholder="Ej: Herramientas Eléctricas"
                    value={form.nombre || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fa-solid fa-image form-label-icon"></i> Imagen de la Categoría
                  </label>
                  <input
                    className="file-input-modern"
                    type="file"
                    accept="image/*"
                    name="imagen"
                    onChange={handleChange}
                  />

                  {editingId && form.imagen && typeof form.imagen === "string" && (
                    <div className="modal-image-preview-wrapper">
                      <span className="preview-label">Imagen actual:</span>
                      <img
                        src={`${API_URL}/uploads/${form.imagen}`}
                        alt="Vista previa de categoría"
                        className="modal-image-preview"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* PIE FIJO CON BOTONES VISIBLES SIEMPRE */}
              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕ Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-modal-submit"
                >
                  <i className="fa-solid fa-check"></i> {editingId ? "Actualizar Categoría" : "Crear Categoría"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Categorías */}
        <div className="categorias-table-wrapper">
          <table className="categorias-table">
            <thead>
              <tr>
                <th style={{ width: "80px", textAlign: "center" }}>Imagen</th>
                <th>Nombre de Categoría</th>
                <th style={{ width: "180px", textAlign: "center" }}>
                  Cantidad de Productos
                </th>
                <th style={{ width: "160px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.length > 0 ? (
                categoriasFiltradas.map((c) => {
                  const cantidad = productos.filter(
                    (p) => p.id_categoria === c.id
                  ).length;

                  return (
                    <tr key={c.id}>
                      <td style={{ textAlign: "center" }}>
                        {c.imagen ? (
                          <img
                            src={`${API_URL}/uploads/${c.imagen}`}
                            alt={c.nombre}
                            className="categoria-img"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="categoria-img-placeholder"
                            title="Sin imagen"
                          >
                            📁
                          </div>
                        )}
                      </td>
                      <td>
                        <strong className="categoria-nombre-text">
                          {c.nombre}
                        </strong>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`cat-count-badge ${
                            cantidad === 0 ? "cat-count-zero" : "cat-count-has"
                          }`}
                        >
                          {cantidad} {cantidad === 1 ? "producto" : "productos"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="cat-action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(c)}
                            style={{ backgroundColor: "#a3e635", color: "white" }}
                          >
                            Editar
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(c.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                    {searchTerm
                      ? `No se encontraron categorías que coincidan con "${searchTerm}".`
                      : "No hay categorías registradas."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default SuperUsuarioCategorias;
