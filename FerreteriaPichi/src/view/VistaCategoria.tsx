// src/views/VistaCategoria.jsx
import "./css/Home.css";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
  const productosSectionRef = useRef<HTMLElement>(null);

  const scrollToProductos = () => {
    if (productosSectionRef.current) {
      productosSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Cuando cambia el id de la categoría, deslizar suavemente la pantalla hacia los productos
  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        scrollToProductos();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [id]);


  // ============================================
  // AGREGAR AL CARRITO
  // ============================================
  const handleSubmitCarrito = (producto: Producto) => {
    try {
      const precioFinal =
        Number(producto.precioenoferta) > 0
          ? Number(producto.precioenoferta)
          : Number(producto.precio) || 0;

      const storedCart = localStorage.getItem("carrito");
      let carrito: any[] = [];
      try {
        if (storedCart) carrito = JSON.parse(storedCart);
      } catch (e) {
        carrito = [];
      }

      if (!Array.isArray(carrito)) carrito = [];

      const index = carrito.findIndex((item: any) => item && item.id === producto.id);

      if (index !== -1) {
        carrito[index].cantidad = Math.max(1, (Number(carrito[index].cantidad) || 1) + 1);
        carrito[index].precio = Number(carrito[index].precio) || precioFinal;
      } else {
        carrito.push({
          id: Number(producto.id) || Date.now(),
          nombre: String(producto.nombre || "Producto"),
          precio: Number(precioFinal) || 0,
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
    <main>
      <header>
        <Navbar />
      </header>

      <section className="categorias-section">
        <h2 className="categorias-title">Explora Nuestras Categorías</h2>

        <div className="categorias-grid">
          {categoria.map((cat, index) => {
            const isSelected = String(cat.id) === String(id);
            return (
              <Link
                key={cat.id || index}
                to={`/categorias/${cat.id}`}
                className={`categoria-item ${isSelected ? "categoria-item-activa" : ""}`}
                onClick={() => {
                  setTimeout(scrollToProductos, 100);
                }}
              >
                <div className={`categoria-circle ${isSelected ? "circle-activa" : ""}`}>
                  <img
                    src={`${API_URL}/uploads/${cat.imagen}`}
                    alt={cat.nombre}
                  />
                </div>
                <span className={`categoria-name ${isSelected ? "name-activa" : ""}`}>
                  {cat.nombre}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="productos-section" ref={productosSectionRef}>
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
                      src={`${API_URL}/uploads/oferta1.png`}
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

      <Footer />
    </main>
  );
}

export default VistaCategoria;
