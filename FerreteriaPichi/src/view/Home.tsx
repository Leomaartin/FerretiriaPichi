import "./css/Home.css";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import API_URL from "../config/api";


interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  mostrar: boolean | number;
  mostrar_inicio: boolean | number;
  imagenes?: string[];
  precioenoferta?: number | string;
}

const isChecked = (val: any): boolean =>
  val === true || val === 1 || val === "true" || val === "1";

interface Categoria {
  id: number;
  nombre: string;
  imagen?: string;
}

const CAROUSEL_ITEMS = [
  {
    src: `${API_URL}/uploads/img/banner1.jpg`,
    title: "Las herramientas más fiables",
    subtitle: "Rápido y sin complicaciones.",
  },
  {
    src: `${API_URL}/uploads/img/banner2.webp`,
    title: "Más que una ferretería",
    subtitle: "Elegí entre los mejores precios.",
  },
  {
    src: `${API_URL}/uploads/img/banner4.webp`,
    title: "",
    subtitle: "",
  },
];

function SimpleCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const goToNext = () =>
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
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
            {(item.title || item.subtitle) && (
              <div className="carousel-caption">
                {item.title && <h3>{item.title}</h3>}
                {item.subtitle && <p>{item.subtitle}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

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

function Home() {
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState<Categoria[]>([]);
  const [categoriaStart, setCategoriaStart] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/productos`);

        // Solo mostrar en Home los productos con check de inicio activo
        const visibles = res.data.filter((p: Producto) =>
          isChecked(p.mostrar_inicio)
        );

        console.log(res.data);
        setProductosFiltrados(visibles);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categoria`);
        setCategoria(res.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  // Auto-scroll logic for categories
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      nextCategory();
    }, 4000);

    return () => {
      resetTimeout();
    };
  }, [categoriaStart, categoria]);

  const nextCategory = () => {
    setCategoriaStart((prev) =>
      prev + 1 + itemsPerPage <= categoria.length ? prev + 1 : 0
    );
  };

  const prevCategory = () => {
    setCategoriaStart((prev) =>
      prev - 1 >= 0 ? prev - 1 : Math.max(categoria.length - itemsPerPage, 0)
    );
  };


  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>

        {/* BANNER */}
        <section className="banner-section">
          <SimpleCarousel />
        </section>

        {/* CATEGORÍAS */}
        <section className="categorias-section" style={{ marginTop: "5%" }}>
          <h2
            className="categorias-title"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Explora Nuestras Categorías
          </h2>

          <div className="categorias-grid">
            {categoria.length > itemsPerPage && (
              <button className="carousel-btn left" onClick={prevCategory}>
                {"<"}
              </button>
            )}

            <div className="categorias-track-container">
              <div
                className="categorias-track"
                style={{
                  transform: `translateX(-${categoriaStart * (100 / itemsPerPage)
                    }%)`,
                }}
              >
                {categoria.map((cat, index) => (
                  <div key={index} className="categoria-item-wrapper">
                    <Link to={`/categorias/${cat.id}`} className="categoria-item">
                      <div className="categoria-circle">
                        <img
                          src={cat.imagen ? `${API_URL}/uploads/${cat.imagen}` : `${API_URL}/uploads/default.png`}
                          alt={cat.nombre}
                        />
                      </div>
                      <span className="categoria-name">{cat.nombre}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {categoria.length > itemsPerPage && (
              <button className="carousel-btn right" onClick={nextCategory}>
                {">"}
              </button>
            )}
          </div>
        </section>

        {/* PRODUCTOS */}
        <section className="productos-section">
          <div className="productos-header">
            <h2
              style={{ fontFamily: "Montserrat, sans-serif" }}
              className="nuestros-productos"
            >
              Productos mas vendidos
            </h2>
          </div>

          {/* PRODUCTOS VISIBLES */}
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
    </>
  );
}

export default Home;
