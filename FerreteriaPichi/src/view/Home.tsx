import "./css/Home.css";
import axios from "axios";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenes?: string[];
}

interface Categoria {
  id: number;
  nombre: string;
  imagen?: string;
}

function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<Categoria[]>([]);
  const [categoriaStart, setCategoriaStart] = useState(0);
  const [orden, setOrden] = useState("az");
  const [busqueda, setBusqueda] = useState(""); // <-- NUEVO ESTADO
  const navigate = useNavigate();

  // ============================================
  // AGREGAR AL CARRITO (localStorage)
  // ============================================
  const handleSubmitCarrito = (producto: Producto) => {
    try {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const index = carrito.findIndex((item: any) => item.id === producto.id);

      if (index !== -1) {
        carrito[index].cantidad += 1;
      } else {
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad: 1,
          imagen: producto.imagenes?.[0] ?? "default.png",
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      toast.success("Producto agregado al carrito correctamente");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  // ============================================
  // TRAER PRODUCTOS
  // ============================================
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get("http://localhost:3334/api/productos");
        setProductos(res.data);
        setProductosFiltrados(res.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProductos();
  }, []);

  // ============================================
  // TRAER CATEGORÍAS
  // ============================================
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get("http://localhost:3334/api/categoria");
        setCategoria(res.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  // ============================================
  // ORDENAMIENTO + FILTRO DE BÚSQUEDA
  // ============================================
  useEffect(() => {
    let temp = [...productos];

    // Filtrado por texto
    if (busqueda.trim() !== "") {
      temp = temp.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Ordenamiento
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

  // ============================================
  // CARRUSEL SIMPLE
  // ============================================
  const CAROUSEL_ITEMS = [
    {
      src: "./backend/uploads/img/banner1.jpg",
      title: "Las herramientas más fiables",
      subtitle: "Rápido y sin complicaciones.",
    },
    {
      src: "./backend/uploads/img/banner2.webp",
      title: "Más que una ferretería",
      subtitle: "Elegí entre los mejores precios.",
    },
    {
      src: "./backend/uploads/img/banner4.webp",
    },
  ];

  function SimpleCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const goToNext = () =>
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    const goToPrev = () =>
      setActiveIndex(
        (prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length
      );
    const goToSlide = (index: number) => setActiveIndex(index);

    useEffect(() => {
      const interval = setInterval(goToNext, 5000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="carousel-container">
        <div
          className="carousel-content"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {CAROUSEL_ITEMS.map((item, index) => (
            <div key={index} className="carousel-slide">
              <img src={item.src} alt={`Slide ${index + 1}`} />
              <div className="carousel-caption">
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-btn left" onClick={goToPrev}>
          {"<"}
        </button>
        <button className="carousel-btn right" onClick={goToNext}>
          {">"}
        </button>
        <div className="carousel-indicators">
          {CAROUSEL_ITEMS.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === activeIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main>
      <header>
        <Navbar />
      </header>

      {/* BANNER */}
      <section className="banner-section">
        <SimpleCarousel />
      </section>
      <Toaster />

      {/* CATEGORÍAS */}
      <section className="categorias-section" style={{ marginTop: "5%" }}>
        <h2
          className="categorias-title"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Explora Nuestras Categorías
        </h2>
        <div className="categorias-grid">
          <button
            className="carousel-btn left"
            style={{ marginTop: "17%", marginLeft: "15%" }}
            onClick={() =>
              setCategoriaStart((prev) =>
                prev - 1 >= 0 ? prev - 1 : Math.max(categoria.length - 4, 0)
              )
            }
          >
            {"<"}
          </button>
          {categoria
            .slice(categoriaStart, categoriaStart + 4)
            .map((cat, index) => (
              <Link
                key={index}
                to={`/categorias/${cat.id}`}
                className="categoria-item"
              >
                <div className="categoria-circle">
                  <img
                    src={`./backend/uploads/${cat.imagen}`}
                    alt={cat.nombre}
                  />
                </div>
                <span className="categoria-name">{cat.nombre}</span>
              </Link>
            ))}
          <button
            className="carousel-btn right"
            style={{ marginTop: "17%", marginRight: "15%" }}
            onClick={() =>
              setCategoriaStart((prev) =>
                prev + 1 + 4 <= categoria.length ? prev + 1 : 0
              )
            }
          >
            {">"}
          </button>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="productos-section">
        <div className="productos-header">
          <h2 style={{ fontFamily: "Montserrat, sans-serif" }}>
            Nuestros Productos
          </h2>

          <div className="filtros">
            {/* Buscador */}
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="buscador-productos"
            />

            {/* Orden */}
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
                    producto.imagenes?.[0]
                      ? `./backend/uploads/${producto.imagenes[0]}`
                      : "./backend/uploads/default.png"
                  }
                  alt={producto.nombre}
                />
              </div>

              <div className="producto-info">
                <h3>{producto.nombre}</h3>
                <p className="descripcion">{producto.descripcion}</p>
                <p className="precio">${producto.precio}</p>
                <p className="stock">Stock: {producto.stock}</p>

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
        <p>&copy; 2023 Ferretería Casa Mario. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default Home;
