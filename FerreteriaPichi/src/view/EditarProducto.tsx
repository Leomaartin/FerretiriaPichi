import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/EditarProducto.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  id_categoria: number;
  imagen: string | null;
  stock: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

const SuperUsuarioProductos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 Buscador
  const [form, setForm] = useState<Partial<Producto> & { imagenFile?: File }>(
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);

  const navigate = useNavigate();

  // Traer productos
  const fetchProductos = async () => {
    try {
      const res = await axios.get("http://localhost:3334/api/productos");
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([]);
    }
  };

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
    fetchProductos();
    fetchCategorias();
  }, []);

  // Manejo de cambios en el formulario
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (e.target.type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      setForm({ ...form, imagenFile: file });
    } else {
      const value =
        e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setForm({ ...form, [e.target.name]: value });
    }
  };

  // Guardar o actualizar producto
  const handleSubmit = async () => {
    if (
      !form.nombre ||
      !form.descripcion ||
      !form.precio ||
      !form.id_categoria
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("descripcion", form.descripcion);
      formData.append("precio", form.precio);
      formData.append("id_categoria", String(form.id_categoria));
      formData.append("stock", String(form.stock ?? 0));

      if (form.imagenFile) {
        formData.append("imagen", form.imagenFile);
      }

      if (editingId) {
        await axios.put(
          `http://localhost:3334/api/productos/${editingId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.post("http://localhost:3334/api/productos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setForm({});
      setEditingId(null);
      fetchProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  // Editar producto
  const handleEdit = (producto: Producto) => {
    setForm(producto);
    setEditingId(producto.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Eliminar producto
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await axios.delete(`http://localhost:3334/api/productos/${id}`);
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  // 🔹 Filtrado de productos
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main style={{ marginTop: "-1%" }}>
      <header>
        <Navbar />
      </header>
      <div className="superusuario-container">
        <h1>Gestión de Productos</h1>

        {/* Formulario */}
        <div className="form-container">
          <h2>{editingId ? "Editar Producto" : "Agregar Producto"}</h2>

          <h3>Nombre Producto</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre || ""}
            onChange={handleChange}
          />

          <h3>Descripción Producto</h3>
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion || ""}
            onChange={handleChange}
          />

          <h3>Precio Producto</h3>
          <input
            type="text"
            name="precio"
            placeholder="Precio"
            value={form.precio || ""}
            onChange={handleChange}
          />

          <h3>Categoría</h3>
          <select
            name="id_categoria"
            value={form.id_categoria || ""}
            onChange={handleChange}
          >
            <option value="">Selecciona categoría</option>
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
            placeholder="Stock"
            value={form.stock ?? 0}
            onChange={handleChange}
          />

          <button
            onClick={handleSubmit}
            style={{ backgroundColor: "#a3e635", color: "white" }}
          >
            {editingId ? "Actualizar" : "Agregar"}
          </button>
        </div>

        {/* Buscador */}
        <div className="buscador-container">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabla de productos */}
        <table className="productos-table">
          <thead>
            <tr style={{ color: "#a3e635" }}>
              <th style={{ backgroundColor: "#a3e635" }}>ID</th>
              <th style={{ backgroundColor: "#a3e635" }}>Nombre</th>
              <th style={{ backgroundColor: "#a3e635" }}>Descripción</th>
              <th style={{ backgroundColor: "#a3e635" }}>Precio</th>
              <th style={{ backgroundColor: "#a3e635" }}>Categoría</th>
              <th style={{ backgroundColor: "#a3e635" }}>Stock</th>
              <th style={{ backgroundColor: "#a3e635" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((p) => (
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
                    <div className="action-buttons-container">
                      <button
                        className="edit-btn"
                        style={{ backgroundColor: "#a3e635", color: "white" }}
                        onClick={() => handleEdit(p)}
                      >
                        Editar Producto
                      </button>
                      <button
                        className="edit-btn"
                        style={{ backgroundColor: "#a3e635", color: "white" }}
                        onClick={() => navigate(`/editar-imagenes/${p.id}`)}
                      >
                        Editar imágenes
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
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  No hay productos
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
