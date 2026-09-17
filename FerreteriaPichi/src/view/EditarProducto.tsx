import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/EditarProducto.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import notify from "../utils/toastNotifier";
import { useConfirm } from "../components/ConfirmModal/ConfirmContext";
import API_URL from "../config/api";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  id_categoria: number;
  imagen: string | null;
  imagenes?: string[];
  stock: number;
  mostrar: boolean | number;
  mostrar_inicio: boolean | number;
  precioenoferta: number | string;
}

const isChecked = (val: any): boolean =>
  val === true || val === 1 || val === "true" || val === "1";

interface Categoria {
  id: number;
  nombre: string;
}

const SuperUsuarioProductos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");

  const [form, setForm] = useState<Partial<Producto> & { imagenFile?: File }>({
    mostrar: 0,
    mostrar_inicio: 0,
    precioenoferta: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // Traer productos
  const fetchProductos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/productos`);
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([]);
    }
  };

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
    fetchProductos();
    fetchCategorias();
  }, []);

  // Manejo inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const file = e.target.files?.[0];
      setForm({ ...form, imagenFile: file });
      return;
    }

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setForm({ ...form, [e.target.name]: e.target.checked ? 1 : 0 });
      return;
    }

    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value, // 🔹 guardamos como string
    });
  };

  // Guardar o actualizar
  const handleSubmit = async () => {
    try {
      const dataToSend = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        id_categoria: form.id_categoria,
        stock: form.stock ?? 0,
        mostrar: isChecked(form.mostrar),
        mostrar_inicio: isChecked(form.mostrar_inicio) ? 1 : 0,
        precioenoferta: form.precioenoferta ? Number(form.precioenoferta) : 0,
      };

      const nombreProducto = form.nombre || "Producto";

      if (editingId) {
        const confirmed = await confirm({
          title: "¿Guardar modificaciones?",
          message: "¿Estás seguro de que querés actualizar este producto con los nuevos datos?",
          itemName: nombreProducto,
          confirmText: "Sí, actualizar",
          cancelText: "Cancelar",
          type: "info",
        });
        if (!confirmed) return;

        await axios.put(
          `${API_URL}/api/productos/${editingId}`,
          dataToSend,
          { headers: { "Content-Type": "application/json" } }
        );
        notify.productUpdated(nombreProducto);
      } else {
        const formData = new FormData();
        Object.entries(dataToSend).forEach(([k, v]) =>
          formData.append(k, String(v))
        );
        if (form.imagenFile) formData.append("imagen", form.imagenFile);

        await axios.post(`${API_URL}/api/productos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notify.productCreated(nombreProducto);
      }

      setForm({ mostrar: false, mostrar_inicio: 0, precioenoferta: "" });
      setEditingId(null);
      setIsModalOpen(false);
      fetchProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      notify.error("Error al guardar producto", "Por favor, verificá los datos ingresados e intentá nuevamente.");
    }
  };

  // Actualizar mostrar
  const actualizarMostrar = async (id: number, value: boolean) => {
    // Actualización inmediata del estado (optimista)
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, mostrar: value } : p))
    );

    try {
      await axios.put(`${API_URL}/api/productos/${id}/mostrar`, {
        mostrar: value,
      });
      notify.statusChanged(
        "Visibilidad de Producto",
        value ? "El producto ahora está visible en la web" : "El producto se ocultó de la web"
      );
    } catch (error) {
      console.error("Error al actualizar mostrar", error);
      notify.error("Error al actualizar estado", "No se pudo cambiar la visibilidad.");
      // Revertir si falló
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, mostrar: !value } : p))
      );
    }
  };

  // Actualizar mostrar_inicio
  const actualizarMostrarInicio = async (id: number, value: boolean) => {
    // Actualización inmediata del estado (optimista)
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, mostrar_inicio: value ? 1 : 0 } : p))
    );

    try {
      await axios.put(`${API_URL}/api/productos/${id}/mostrar-inicio`, {
        mostrar_inicio: value ? 1 : 0,
      });
      notify.statusChanged(
        "Destacado en Inicio",
        value ? "El producto ahora se muestra en el Home" : "El producto ya no se muestra en el Home"
      );
    } catch (error) {
      console.error("Error al actualizar mostrar_inicio", error);
      notify.error("Error al actualizar estado", "No se pudo cambiar el estado en el Home.");
      // Revertir si falló
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, mostrar_inicio: !value ? 1 : 0 } : p))
      );
    }
  };

  // Editar
  const handleEdit = (p: Producto) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      id_categoria: p.id_categoria,
      stock: p.stock,
      mostrar: isChecked(p.mostrar),
      mostrar_inicio: isChecked(p.mostrar_inicio) ? 1 : 0,
      precioenoferta: p.precioenoferta ? p.precioenoferta.toString() : "",
    });

    setEditingId(p.id);
    setIsModalOpen(true);
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    const prod = productos.find((p) => p.id === id);
    const nombreProd = prod ? prod.nombre : `Producto #${id}`;

    const confirmed = await confirm({
      title: "¿Eliminar Producto?",
      message: "¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.",
      itemName: nombreProd,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/productos/${id}`);
      notify.productDeleted(nombreProd);
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      notify.error("Error al eliminar", "No se pudo eliminar el producto del sistema.");
    }
  };

  // Filtrado de productos por texto y categoría
  const productosFiltrados = productos.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchBusqueda =
      term === "" ||
      p.nombre.toLowerCase().includes(term) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term));
    const matchCategoria =
      categoriaFiltro === "todas" || String(p.id_categoria) === String(categoriaFiltro);
    return matchBusqueda && matchCategoria;
  });

  const totalProductos = productos.length;
  const totalFiltrados = productosFiltrados.length;
  const hayFiltrosActivos = searchTerm.trim() !== "" || categoriaFiltro !== "todas";

  return (
    <main style={{ marginTop: "8%" }}>
      <Navbar />

      <div className="superusuario-container">
        <div className="header-admin">
          <div>
            <h1>Gestión de Productos</h1>
            <p className="admin-section-subtitle">
              Administrá el catálogo de productos, categorías, visibilidad y fotos
            </p>
          </div>
          <button
            className="btn-nuevo"
            onClick={() => {
              setForm({ mostrar: false, mostrar_inicio: 0, precioenoferta: "" });
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            + Nuevo Producto
          </button>
        </div>

        {/* Panel de estadísticas rápidas */}
        <div className="admin-stats-bar">
          <div className="stat-card">
            <span className="stat-label">Total de Productos</span>
            <span className="stat-value">{totalProductos}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Categorías</span>
            <span className="stat-value">{categorias.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Visibles en Web</span>
            <span className="stat-value">
              {productos.filter((p) => isChecked(p.mostrar)).length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Destacados en Home</span>
            <span className="stat-value">
              {productos.filter((p) => isChecked(p.mostrar_inicio)).length}
            </span>
          </div>
        </div>

        {/* Formulario Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div
              className="modal-content fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingId ? "Editar Producto" : "Agregar Producto"}</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✖
                </button>
              </div>

              <div className="form-container modal-body">
                <h3>Nombre</h3>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre || ""}
                  onChange={handleChange}
                />

                <h3>Descripción</h3>
                <textarea
                  name="descripcion"
                  value={form.descripcion || ""}
                  onChange={handleChange}
                />

                <h3>Precio</h3>
                <input
                  type="text"
                  name="precio"
                  value={form.precio || ""}
                  onChange={handleChange}
                />

                <h3>Precio Oferta</h3>
                <input
                  type="number"
                  name="precioenoferta"
                  value={form.precioenoferta || ""}
                  onChange={handleChange}
                />

                <h3>Categoría</h3>
                <select
                  name="id_categoria"
                  value={form.id_categoria || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>

                <h3>Stock</h3>
                <input
                  type="number"
                  name="stock"
                  value={form.stock ?? 0}
                  onChange={handleChange}
                />

                <div className="checkbox-container">
                  <h3 style={{ margin: 0, marginRight: "10px" }}>
                    Mostrar en la web / categorías
                  </h3>
                  <input
                    type="checkbox"
                    name="mostrar"
                    checked={isChecked(form.mostrar)}
                    onChange={handleChange}
                  />
                </div>

                <div className="checkbox-container">
                  <h3 style={{ margin: 0, marginRight: "10px" }}>
                    Mostrar al Inicio (Home)
                  </h3>
                  <input
                    type="checkbox"
                    name="mostrar_inicio"
                    checked={isChecked(form.mostrar_inicio)}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
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

      {/* Barra de Filtros y Búsqueda */}
      <div className="filtros-admin-bar">
        <div className="filtros-left-group">
          {/* Buscador */}
          <div className="buscador-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
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

          {/* Filtro por Categoría */}
          <div className="categoria-filter-wrapper">
            <label htmlFor="categoria-select" className="filter-label">
              Categoría:
            </label>
            <select
              id="categoria-select"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="admin-categoria-select"
            >
              <option value="todas">
                Todas las categorías ({totalProductos})
              </option>
              {categorias.map((c) => {
                const count = productos.filter(
                  (p) => p.id_categoria === c.id
                ).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Botón de limpiar filtros si hay alguno activo */}
          {hayFiltrosActivos && (
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSearchTerm("");
                setCategoriaFiltro("todas");
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Indicador de resultados */}
        <div className="resultados-count-badge">
          {hayFiltrosActivos ? (
            <span>
              Mostrando <strong>{totalFiltrados}</strong> de{" "}
              <strong>{totalProductos}</strong> productos
            </span>
          ) : (
            <span>
              Total: <strong>{totalProductos}</strong> productos
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="table-responsive-container">
        <table className="productos-table">
          <thead>
            <tr>
              {[
                "Foto",
                "Nombre",
                "Descripción",
                "Precio",
                "Categoría",
                "Stock",
                "Mostrar",
                "Mostrar al Inicio",
                "Oferta",
                "Acciones",
              ].map((t) => (
                <th key={t} style={{ backgroundColor: "#a3e635" }}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((p) => {
                const primeraImagen =
                  p.imagenes && p.imagenes.length > 0 && p.imagenes[0]
                    ? p.imagenes[0]
                    : p.imagen;

                return (
                  <tr key={p.id}>
                    {/* Foto en vez de ID */}
                    <td style={{ textAlign: "center", width: "75px" }}>
                      {primeraImagen ? (
                        <img
                          src={`${API_URL}/uploads/${primeraImagen}`}
                          alt={p.nombre}
                          className="producto-tabla-thumb"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="producto-tabla-thumb-placeholder"
                          title="Sin imagen"
                        >
                          <span>📷</span>
                        </div>
                      )}
                    </td>

                    <td>
                      <strong className="producto-nombre-cell">{p.nombre}</strong>
                    </td>
                    <td>{p.descripcion}</td>
                    <td>
                      <strong>${Number(p.precio).toLocaleString("es-AR")}</strong>
                    </td>
                    <td>
                      <span className="categoria-pill">
                        {categorias.find((c) => c.id === p.id_categoria)?.nombre ||
                          `Cat. #${p.id_categoria}`}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`stock-badge ${
                          p.stock <= 0 ? "stock-cero" : p.stock < 5 ? "stock-bajo" : "stock-ok"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        style={{ cursor: "pointer", width: "18px", height: "18px" }}
                        checked={isChecked(p.mostrar)}
                        onChange={(e) => actualizarMostrar(p.id, e.target.checked)}
                        title="Mostrar en la web"
                      />
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        style={{ cursor: "pointer", width: "18px", height: "18px" }}
                        checked={isChecked(p.mostrar_inicio)}
                        onChange={(e) =>
                          actualizarMostrarInicio(p.id, e.target.checked)
                        }
                        title="Destacar en el Home"
                      />
                    </td>

                    <td>
                      {Number(p.precioenoferta) > 0 ? (
                        <span className="oferta-badge">
                          ${Number(p.precioenoferta).toLocaleString("es-AR")}
                        </span>
                      ) : (
                        <span className="sin-oferta">-</span>
                      )}
                    </td>

                    <td>
                      <div className="action-buttons-container">
                        <button
                          className="edit-btn"
                          style={{ backgroundColor: "#a3e635", color: "white" }}
                          onClick={() => handleEdit(p)}
                        >
                          Editar
                        </button>

                        <button
                          className="edit-btn btn-fotos"
                          style={{ backgroundColor: "#3b82f6", color: "white" }}
                          onClick={() => navigate(`/editar-imagenes/${p.id}`)}
                          title="Gestionar galería de fotos"
                        >
                          Fotos
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(p.id)}
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
                <td colSpan={10} style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <div className="empty-state-container">
                    <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "0.5rem" }}>
                      No se encontraron productos con los filtros seleccionados.
                    </p>
                    {hayFiltrosActivos && (
                      <button
                        className="btn-reset-filters"
                        onClick={() => {
                          setSearchTerm("");
                          setCategoriaFiltro("todas");
                        }}
                      >
                        Quitar filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default SuperUsuarioProductos;
