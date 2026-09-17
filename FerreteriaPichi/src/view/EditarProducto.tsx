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

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main style={{marginTop:"8%"}}>
      
        <Navbar />
     

      <div className="superusuario-container" >
        <div className="header-admin">
          <h1>Gestión de Productos</h1>
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

        {/* Formulario Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? "Editar Producto" : "Agregar Producto"}</h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
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
                  <h3 style={{margin:0, marginRight: '10px'}}>Mostrar en la web / categorías</h3>
                  <input
                    type="checkbox"
                    name="mostrar"
                    checked={isChecked(form.mostrar)}
                    onChange={handleChange}
                  />
                </div>

                <div className="checkbox-container">
                  <h3 style={{margin:0, marginRight: '10px'}}>Mostrar al Inicio (Home)</h3>
                  <input
                    type="checkbox"
                    name="mostrar_inicio"
                    checked={isChecked(form.mostrar_inicio)}
                    onChange={handleChange}
                  />
                </div>

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

      {/* Buscador */}
      <div
        className="buscador-container"
        style={{ width: "20%", marginLeft: "5%" }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <table
        className="productos-table"
        style={{ marginLeft: "5%", marginBottom: "5%", width: "90%" }}
      >
        <thead>
          <tr>
            {[
              "ID",
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
          {productosFiltrados.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.descripcion}</td>
              <td>{p.precio}</td>
              <td>
                {categorias.find((c) => c.id === p.id_categoria)?.nombre ||
                  p.id_categoria}
              </td>
              <td>{p.stock}</td>

              <td>
                <input
                  type="checkbox"
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                  checked={isChecked(p.mostrar)}
                  onChange={(e) => actualizarMostrar(p.id, e.target.checked)}
                />
              </td>

              <td>
                <input
                  type="checkbox"
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                  checked={isChecked(p.mostrar_inicio)}
                  onChange={(e) => actualizarMostrarInicio(p.id, e.target.checked)}
                />
              </td>

              <td>{p.precioenoferta}</td>

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
                    className="edit-btn"
                    style={{ backgroundColor: "#a3e635", color: "white" }}
                    onClick={() => navigate(`/editar-imagenes/${p.id}`)}
                  >
                    Imágenes
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
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default SuperUsuarioProductos;
