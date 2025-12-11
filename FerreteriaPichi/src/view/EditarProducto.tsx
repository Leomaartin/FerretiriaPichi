import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/EditarProducto.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  id_categoria: number;
  imagen: string | null;
  stock: number;
  mostrar: number;
  precioenoferta: number;
}

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
    precioenoferta: "",
  });

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

  // Manejo inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type, value, checked } = e.target;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      setForm({ ...form, imagenFile: file });
      return;
    }

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked ? 1 : 0 });
      return;
    }

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
        mostrar: form.mostrar ?? 0,
        precioenoferta: form.precioenoferta ? Number(form.precioenoferta) : 0,
      };

      if (editingId) {
        await axios.put(
          `http://localhost:3334/api/productos/${editingId}`,
          dataToSend,
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        const formData = new FormData();
        Object.entries(dataToSend).forEach(([k, v]) =>
          formData.append(k, String(v))
        );
        if (form.imagenFile) formData.append("imagen", form.imagenFile);

        await axios.post("http://localhost:3334/api/productos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Producto guardado correctamente");
      setForm({ mostrar: 0, precioenoferta: "" });
      setEditingId(null);
      fetchProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error("Error al guardar producto");
    }
  };

  // Actualizar mostrar
  const actualizarMostrar = async (id: number, value: boolean) => {
    try {
      await axios.put(`http://localhost:3334/api/productos/${id}/mostrar`, {
        mostrar: value ? 1 : 0,
      });

      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, mostrar: value ? 1 : 0 } : p))
      );
    } catch (error) {
      console.error("Error al actualizar mostrar", error);
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
      mostrar: p.mostrar,
      precioenoferta: p.precioenoferta ? p.precioenoferta.toString() : "",
    });

    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que querés eliminar este producto?")) return;

    try {
      await axios.delete(`http://localhost:3334/api/productos/${id}`);
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main style={{marginTop:"8%"}}>
      
        <Navbar />
     

      <div className="superusuario-container" >
        <h1>Gestión de Productos</h1>

        {/* Formulario */}
        <div className="form-container">
          <h2>{editingId ? "Editar Producto" : "Agregar Producto"}</h2>

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

          <h3>Mostrar en inicio</h3>
          <input
            type="checkbox"
            name="mostrar"
            checked={(form.mostrar ?? 0) === 1}
            onChange={handleChange}
          />

          <button
            onClick={handleSubmit}
            style={{ backgroundColor: "#a3e635", color: "white" }}
          >
            {editingId ? "Actualizar" : "Agregar"}
          </button>
        </div>
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
                  style={{ cursor: "pointer" }}
                  checked={p.mostrar === 1}
                  onChange={(e) => actualizarMostrar(p.id, e.target.checked)}
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
