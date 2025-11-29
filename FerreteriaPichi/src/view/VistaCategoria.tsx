// src/views/VistaCategoria.jsx
import "./css/Home.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function VistaCategoria() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState([]);

  // Trae los productos según categoría
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.post(
          `http://localhost:3334/api/categorias/${id}`
        );
        setProductos(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProductos();
  }, [id]);

  // Trae la lista de categorías (para mostrar arriba si querés)
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get("http://localhost:3334/api/categoria");
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
          <h2>Productos de la categoría</h2>
        </div>

        <div className="productos-grid">
          {productos.map((producto) => (
            <Link
              to={`/detalleproducto/${producto.id}`}
              className="producto-card"
              key={producto.id}
            >
              <div className="producto-image-container">
                <img
                  src={
                    producto.imagenes && producto.imagenes.length > 0
                      ? `http://localhost:3334/uploads/${producto.imagenes[0]}`
                      : "http://localhost:3334/uploads/default.png"
                  }
                  alt={producto.nombre}
                />
              </div>

              <div className="producto-info">
                <h3>{producto.nombre}</h3>
                <p className="descripcion">{producto.descripcion}</p>
                <p className="precio">${producto.precio}</p>
                <p className="stock">Stock: {producto.stock}</p>
                <button className="btn-comprar">Agregar al Carrito</button>
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
