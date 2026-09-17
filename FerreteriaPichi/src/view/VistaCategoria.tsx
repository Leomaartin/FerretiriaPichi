// src/views/VistaCategoria.jsx
import "./css/Home.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Navbar from "../components/Navbar";
import API_URL from "../config/api";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  mostrar: boolean | number;
  mostrar_inicio?: boolean | number;
  precioenoferta?: number | string;
  imagenes?: string[];
}

const isChecked = (val: any): boolean =>
  val === true || val === 1 || val === "true" || val === "1";

interface Categoria {
  id: number;
  nombre: string;
  imagen?: string;
}

function VistaCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("az");


  // ============================================
  // AGREGAR AL CARRITO
  // ============================================
  const handleSubmitCarrito = (producto: Producto) => {
    try {
      const precioFinal =
        Number(producto.precioenoferta) > 0
          ? Number(producto.precioenoferta)
          : Number(producto.precio);

      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const index = carrito.findIndex((item: any) => item.id === producto.id);

      if (index !== -1) {
        carrito[index].cantidad += 1;
      } else {
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: precioFinal,
          cantidad: 1,
          imagen: producto.imagenes?.[0] ?? "default.png",
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Producto agregado al carrito correctamente");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };


  // Trae los productos según categoría
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/api/categorias/${id}`
        );
        // Solo mostrar productos con el check de mostrar activo
        const visibles = res.data.filter((p: Producto) => isChecked(p.mostrar));
        setProductos(visibles);
        setProductosFiltrados(visibles);
        console.log(res.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProductos();
  }, [id]);

  // Filtrado y Ordenamiento
  useEffect(() => {
    let temp = [...productos];

    if (busqueda.trim() !== "") {
      temp = temp.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    switch (orden) {
      case "az":
        temp.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "za":
        temp.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case "precio-asc":
        temp.sort((a, b) => a.precio - b.precio);
        break;
      case "precio-desc":
        temp.sort((a, b) => b.precio - a.precio);
        break;
    }

    setProductosFiltrados(temp);
  }, [orden, productos, busqueda]);

  // Trae la lista de categorías (para mostrar arriba si querés)
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categoria`);
        setCategoria(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  return (
    <main style={{ marginTop: "-1%" }}>
      <header>
        <Navbar />
      </header>

      <section className="categorias-section">
        <h2 className="categorias-title">Explora Nuestras Categorías</h2>

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "2px solid #a3e635",
            color: "#a3e635",
            borderRadius: "8px",
            padding: "8px 18px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.95rem",
            marginBottom: "16px",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "#a3e635";
            (e.currentTarget as HTMLButtonElement).style.color = "white";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "none";
            (e.currentTarget as HTMLButtonElement).style.color = "#a3e635";
          }}
        >
          ← Volver
        </button>
        <div className="categorias-grid">
          {categoria.map((cat, index) => (
            <Link
              key={index}
              to={`/categorias/${cat.id}`}
              className="categoria-item"
            >
              <div className="categoria-circle">
                <img
                  src={`../backend/uploads/${cat.imagen}`}
                  alt={cat.nombre}
                />
              </div>
              <span className="categoria-name">{cat.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="productos-section">
        <div className="productos-header">
          <h2>
            Productos de la categoría -{" "}
            {categoria.find((c: any) => c.id == id)?.nombre || ""}
          </h2>
            <div className="filtros">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="buscador-productos"
            />

            <div className="ordenar-productos">
              <label htmlFor="ordenar">Ordenar por:</label>
              <select
                id="ordenar"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="precio-asc">Precio Asc.</option>
                <option value="precio-desc">Precio Desc.</option>
              </select>
            </div>
          </div>
        </div>

        <div className="productos-grid">
           {productosFiltrados.map((producto) => (
            <Link
              to={`/detalleproducto/${producto.id}`}
              className="producto-card"
              key={producto.id}
            >
              <div className="producto-image-container">
               <img
                  src={
                    producto.imagenes && producto.imagenes.length > 0
                      ? `${API_URL}/uploads/${producto.imagenes[0]}`
                      : `${API_URL}/uploads/default.png`
                  }
                  alt={producto.nombre}
                />
              </div>

              <div className="producto-info">
                <h3>{producto.nombre}</h3>

                {Number(producto.precioenoferta) > 0 ? (
                  <>
                    <span className="precio-tachado">${producto.precio}</span>
                    <img
                      src="../backend/uploads/oferta1.png"
                      className="badge-oferta"
                      alt="Oferta"
                    />
                    <span className="precio-oferta">
                      ${Number(producto.precioenoferta)}
                    </span>
                  </>
                ) : (
                  <span className="precio-normal">${producto.precio}</span>
                )}

                <button
                  className="btn-carrito"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmitCarrito(producto);
                  }}
                >
                  Agregar al Carrito
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer>
        <p>&copy; 2023 El Tornillo Feliz. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default VistaCategoria;
