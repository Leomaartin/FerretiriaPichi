import "./css/DetalleProducto.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

// Función auxiliar para construir la URL de la imagen
const buildImageUrl = (imageName: string) => `../backend/uploads/${imageName}`;

function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3334/api/detalleproducto/${id}`
        );
        const prod = res.data[0];

        // 1. Establecer producto
        setProducto(prod);

        // 2. Establecer la primera imagen como principal
        const firstImage =
          prod.imagenes && prod.imagenes.length > 0
            ? buildImageUrl(prod.imagenes[0]) // Usamos la función auxiliar
            : "../backend/uploads/default.png";

        setMainImage(firstImage);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };

    fetchProducto();
  }, [id]); // Dependencia solo del ID

  // Función de clic para cambiar la imagen principal
  const handleThumbnailClick = (imageName: string) => {
    setMainImage(buildImageUrl(imageName));
  };
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
  const handleSubmitCompraAhora = (producto: Producto) => {
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
      navigate("/carrito");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  if (!producto) return <h2>Cargando...</h2>;

  return (
    <main className="product-detail-page">
      <header className="product-detail-header">
        <Navbar />
        <Toaster />
      </header>

      <section
        className="product-detail-container"
        style={{
          marginTop: "10%",
        }}
      >
        <div className="product-images">
          {/* Imagen principal grande */}
          <div className="main-image">
            <img src={mainImage} alt={producto.nombre} />
          </div>

          {/* Miniaturas abajo */}
          {producto.imagenes && producto.imagenes.length > 1 && (
            <div className="thumbnail-images">
              {producto.imagenes.map((img: string, index: number) => (
                <img
                  key={index}
                  src={buildImageUrl(img)} // Usamos la URL completa para la miniatura
                  alt={`${producto.nombre} ${index}`}
                  // La clase 'selected' se aplica si la URL COMPLETA de la miniatura coincide con mainImage
                  className={mainImage === buildImageUrl(img) ? "selected" : ""}
                  onClick={() => handleThumbnailClick(img)}
                />
              ))}
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

          <p className="product-price-detail">${producto.precio}</p>

          <div className="product-actions">
            {/* Manteniendo btn-carrito-2 */}
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
            <p>{producto.descripcion}</p>
          </div>
        </div>
      </section>

      <footer className="product-detail-footer">
        <p>&copy; 2023 El Tornillo Feliz. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default DetalleProducto;
