import "./css/DetalleProducto.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import API_URL from "../config/api";

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  precioenoferta?: number | string;
  marca?: string;
  modelo?: string;
  imagenes?: string[];
  stock?: number;
}

const buildImageUrl = (imageName: string) => {
  if (!imageName || imageName.trim() === "") {
    return `${API_URL}/uploads/default.png`;
  }
  if (imageName.startsWith("http://") || imageName.startsWith("https://")) {
    return imageName;
  }
  return `${API_URL}/uploads/${imageName.trim()}`;
};

function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [mainImage, setMainImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/detalleproducto/${id}`
        );
        const prod = res.data[0];

        setProducto(prod);

        const validImages = (prod?.imagenes || []).filter(
          (img: string) => img && img.trim() !== ""
        );

        const firstImage = validImages.length > 0
          ? buildImageUrl(validImages[0])
          : `${API_URL}/uploads/default.png`;

        setMainImage(firstImage);
      } catch (error) {
        console.error("Error al cargar producto:", error);
      }
    };

    fetchProducto();
  }, [id]);

  const handleThumbnailClick = (imageName: string) => {
    setMainImage(buildImageUrl(imageName));
  };

  const handleSubmitCarrito = (prod: any) => {
    try {
      const precioFinal =
        Number(prod.precioenoferta) > 0
          ? Number(prod.precioenoferta)
          : Number(prod.precio) || 0;

      const storedCart = localStorage.getItem("carrito");
      let carrito: any[] = [];
      try {
        if (storedCart) carrito = JSON.parse(storedCart);
      } catch (e) {
        carrito = [];
      }

      if (!Array.isArray(carrito)) carrito = [];

      const index = carrito.findIndex((item: any) => item && item.id === prod.id);

      if (index !== -1) {
        carrito[index].cantidad = Math.max(1, (Number(carrito[index].cantidad) || 1) + 1);
        carrito[index].precio = Number(carrito[index].precio) || precioFinal;
      } else {
        const validImgs = (prod.imagenes || []).filter(
          (img: string) => img && img.trim() !== ""
        );
        carrito.push({
          id: Number(prod.id) || Date.now(),
          nombre: String(prod.nombre || "Producto"),
          precio: Number(precioFinal) || 0,
          cantidad: 1,
          imagen: validImgs.length > 0 ? validImgs[0] : "default.png",
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Producto agregado al carrito correctamente");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  const handleSubmitCompraAhora = (prod: any) => {
    try {
      const precioFinal =
        Number(prod.precioenoferta) > 0
          ? Number(prod.precioenoferta)
          : Number(prod.precio) || 0;

      const storedCart = localStorage.getItem("carrito");
      let carrito: any[] = [];
      try {
        if (storedCart) carrito = JSON.parse(storedCart);
      } catch (e) {
        carrito = [];
      }

      if (!Array.isArray(carrito)) carrito = [];

      const index = carrito.findIndex((item: any) => item && item.id === prod.id);

      if (index !== -1) {
        carrito[index].cantidad = Math.max(1, (Number(carrito[index].cantidad) || 1) + 1);
        carrito[index].precio = Number(carrito[index].precio) || precioFinal;
      } else {
        const validImgs = (prod.imagenes || []).filter(
          (img: string) => img && img.trim() !== ""
        );
        carrito.push({
          id: Number(prod.id) || Date.now(),
          nombre: String(prod.nombre || "Producto"),
          precio: Number(precioFinal) || 0,
          cantidad: 1,
          imagen: validImgs.length > 0 ? validImgs[0] : "default.png",
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/carrito");
    } catch (error) {
      console.error("Error en compra ahora:", error);
    }
  };

  if (!producto) {
    return (
      <main className="product-detail-page">
        <Navbar />
        <div style={{ textAlign: "center", padding: "10rem 1rem" }}>
          <h2>Cargando producto...</h2>
        </div>
      </main>
    );
  }

  const validImages = (producto.imagenes || []).filter(
    (img: string) => img && img.trim() !== ""
  );

  return (
    <main className="product-detail-page">
      <header className="product-detail-header">
        <Navbar />
      </header>

      <section
        className="product-detail-container"
        style={{ marginTop: "8%" }}
      >
        <div className="product-images">
          <div className="main-image">
            <img
              src={mainImage || `${API_URL}/uploads/default.png`}
              alt={producto.nombre}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${API_URL}/uploads/default.png`;
              }}
            />
          </div>

          {validImages.length > 1 && (
            <div className="thumbnail-images">
              {validImages.map((img, index) => {
                const fullImgUrl = buildImageUrl(img);
                return (
                  <img
                    key={index}
                    src={fullImgUrl}
                    alt={`${producto.nombre} miniatura ${index + 1}`}
                    className={mainImage === fullImgUrl ? "selected" : ""}
                    onClick={() => handleThumbnailClick(img)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `${API_URL}/uploads/default.png`;
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="product-info-detail">
          <h1 className="product-name-detail">{producto.nombre}</h1>

          {producto.marca && producto.modelo && (
            <p className="product-brand-model">
              Marca: <span>{producto.marca}</span> | Modelo:{" "}
              <span>{producto.modelo}</span>
            </p>
          )}

          {/* PRECIO Y OFERTA */}
          <div className="precio-container-detalle">
            {Number(producto.precioenoferta) > 0 ? (
              <>
                <p className="precio-tachado">
                  ${Number(producto.precio).toLocaleString("es-AR")}
                </p>
                <p className="precio-oferta">
                  ${Number(producto.precioenoferta).toLocaleString("es-AR")}
                </p>
              </>
            ) : (
              <p className="product-price-detail">
                ${Number(producto.precio).toLocaleString("es-AR")}
              </p>
            )}
          </div>

          <div className="product-actions">
            <button
              className="btn-carrito-2"
              style={{ color: "#8cc427" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmitCarrito(producto);
              }}
            >
              Añadir al Carrito
            </button>

            <button
              className="buy-now-btn"
              style={{ color: "white" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmitCompraAhora(producto);
              }}
            >
              Comprar Ahora
            </button>
          </div>

          <div className="product-description-detail">
            <h2>Descripción</h2>
            <p>{producto.descripcion || "Sin descripción disponible."}</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default DetalleProducto;
