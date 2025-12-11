import "./css/DetalleProducto.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Toaster, toast } from "react-hot-toast";

const buildImageUrl = (imageName) => `../backend/uploads/${imageName}`;

function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3334/api/detalleproducto/${id}`
        );
        const prod = res.data[0];

        setProducto(prod);

        const firstImage = prod.imagenes?.length
          ? buildImageUrl(prod.imagenes[0])
          : "../backend/uploads/default.png";

        setMainImage(firstImage);
      } catch (error) {
        console.error("Error al cargar producto:", error);
      }
    };

    fetchProducto();
  }, [id]);

  const handleThumbnailClick = (imageName) => {
    setMainImage(buildImageUrl(imageName));
  };

  const handleSubmitCarrito = (producto: any) => {
    try {
      const precioFinal =
        Number(producto.precioenoferta) > 0
          ? Number(producto.precioenoferta)
          : Number(producto.precio);

      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const index = carrito.findIndex((item: any) => item.id === producto.id);

      if (index !== -1) carrito[index].cantidad += 1;
      else
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: precioFinal,
          cantidad: 1,
          imagen: producto.imagenes?.[0] ?? "default.png",
        });

      localStorage.setItem("carrito", JSON.stringify(carrito));
      toast.success("Producto agregado al carrito correctamente");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  const handleSubmitCompraAhora = (producto: any) => {
    try {
      const precioFinal =
        Number(producto.precioenoferta) > 0
          ? Number(producto.precioenoferta)
          : Number(producto.precio);

      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const index = carrito.findIndex((item: any) => item.id === producto.id);

      if (index !== -1) carrito[index].cantidad += 1;
      else
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: precioFinal, // 👈 precio final
          cantidad: 1,
          imagen: producto.imagenes?.[0] ?? "default.png",
        });

      localStorage.setItem("carrito", JSON.stringify(carrito));
      navigate("/carrito");
    } catch (error) {
      console.error("Error en compra ahora:", error);
    }
  };

  if (!producto) return <h2>Cargando...</h2>;

  return (
    <main className="product-detail-page" >
      <header className="product-detail-header">
        <Navbar />
        <Toaster />
      </header>

      <section
        className="product-detail-container"
        style={{ marginTop: "10%" }}
      >
        <div className="product-images">
          <div className="main-image">
            <img src={mainImage} alt={producto.nombre} />
          </div>

          {producto.imagenes?.length > 1 && (
            <div className="thumbnail-images">
              {producto.imagenes.map((img, index) => (
                <img
                  key={index}
                  src={buildImageUrl(img)}
                  alt={`${producto.nombre} ${index}`}
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

          {/* PRECIO Y OFERTA */}
          <div className="precio-container-detalle">
            {Number(producto.precioenoferta) > 0 ? (
              <>
               
                <p className="precio-tachado">${producto.precio}</p>
                <p className="precio-oferta">${producto.precioenoferta}</p>
              </>
            ) : (
              <p className="product-price-detail">${producto.precio}</p>
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
            <p>{producto.descripcion}</p>
          </div>
        </div>
      </section>

      <footer className="product-detail-footer">
        <p>© 2023 El Tornillo Feliz. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default DetalleProducto;
