// EditarImagenesProducto.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./css/EditarProducto.css"; // Usamos el mismo CSS

const EditarImagenesProducto: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);

  // Traer imágenes del producto
  const fetchImagenes = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3334/api/detalleproducto/${id}`
      );
      const prod = res.data[0];
      // Asegurarse de manejar la imagen individual (si existe) y el array de imágenes
      const allImages = (prod.imagenes || []).filter(
        (img: string) => img && img.trim() !== ""
      );
      setImagenes(allImages);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  useEffect(() => {
    fetchImagenes();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Usar Array.from y luego filter para asegurarse de que solo se añaden archivos
      const files = Array.from(e.target.files);
      setNuevasImagenes([...nuevasImagenes, ...files]);
    }
  };

  // Función para remover la preview de una imagen que se va a subir
  const handleRemoveNewImage = (indexToRemove: number) => {
    setNuevasImagenes(nuevasImagenes.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEliminarImagen = async (imagen: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta imagen?")) return;
    try {
      await axios.delete(`http://localhost:3334/api/imagenes/${id}/${imagen}`);
      setImagenes(imagenes.filter((img) => img !== imagen));
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
    }
  };

  const handleGuardar = async () => {
    if (nuevasImagenes.length === 0) {
      alert("No hay nuevas imágenes para subir.");
      return;
    }

    const formData = new FormData();
    nuevasImagenes.forEach((file) => formData.append("imagenes", file));

    try {
      await axios.post(
        `http://localhost:3334/api/productos/${id}/imagenes`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Imágenes subidas correctamente.");
      setNuevasImagenes([]); // Limpiar previews
      fetchImagenes(); // Recargar imágenes actuales
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      alert("Error al subir imágenes.");
    }
  };

  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div className="superusuario-container">
        <h1>Gestión de Imágenes del Producto #{id}</h1>

        <div className="form-container">
          {/* SECCIÓN 1: IMÁGENES ACTUALES */}
          <h2>Imágenes actuales ({imagenes.length})</h2>
          {imagenes.length > 0 ? (
            <div className="imagenes-grid">
              {" "}
              {/* Usamos grid para la galería */}
              {imagenes.map((img) => (
                <div key={img} className="imagen-item-card">
                  <img
                    src={`http://localhost:3334/uploads/${img}`}
                    alt={img}
                    className="imagen-preview-lg"
                  />
                  <button
                    className="delete-img-btn"
                    onClick={() => handleEliminarImagen(img)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-images-msg">
              No hay imágenes actuales para este producto.
            </p>
          )}

          <hr className="separator" />

          {/* SECCIÓN 2: AGREGAR NUEVAS IMÁGENES */}
          <h2>Agregar nuevas imágenes</h2>
          <p className="hint">Selecciona una o más imágenes a la vez.</p>

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="file-input-modern"
            accept="image/*"
          />

          {/* PREVIEW DE NUEVAS IMÁGENES */}
          {nuevasImagenes.length > 0 && (
            <>
              <h3>Imágenes a subir ({nuevasImagenes.length})</h3>
              <div className="imagenes-grid preview-nuevas-grid">
                {nuevasImagenes.map((file, idx) => (
                  <div key={idx} className="imagen-item-card">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Nueva ${idx}`}
                      className="imagen-preview-lg"
                    />
                    <button
                      className="remove-preview-btn"
                      onClick={() => handleRemoveNewImage(idx)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            onClick={handleGuardar}
            className="guardar-imagenes-btn"
            disabled={nuevasImagenes.length === 0}
          >
            Guardar y Subir{" "}
            {nuevasImagenes.length > 0 && `(${nuevasImagenes.length} imágenes)`}
          </button>

          <button
            onClick={() => navigate("/adminproductos")}
            className="back-btn"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    </main>
  );
};

export default EditarImagenesProducto;
