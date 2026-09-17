// EditarImagenesProducto.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import notify from "../utils/toastNotifier";
import API_URL from "../config/api";
import { useConfirm } from "../components/ConfirmModal/ConfirmContext";
import Navbar from "../components/Navbar";
import "./css/EditarProducto.css";

const EditarImagenesProducto: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [productoNombre, setProductoNombre] = useState<string>("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  // Traer imágenes y datos del producto
  const fetchImagenes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/detalleproducto/${id}`
      );
      const prod = res.data[0];
      if (prod) {
        if (prod.nombre) {
          setProductoNombre(prod.nombre);
        }
        // Asegurarse de manejar el array de imágenes
        const allImages = (prod.imagenes || []).filter(
          (img: string) => img && img.trim() !== ""
        );
        setImagenes(allImages);
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagenes();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNuevasImagenes([...nuevasImagenes, ...files]);
    }
  };

  // Función para remover la preview de una imagen que se va a subir
  const handleRemoveNewImage = (indexToRemove: number) => {
    setNuevasImagenes(nuevasImagenes.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEliminarImagen = async (imagen: string) => {
    const confirmed = await confirm({
      title: "¿Eliminar Imagen?",
      message: `¿Estás seguro de que querés eliminar esta imagen de la galería de ${productoNombre || "este producto"}?`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/imagenes/${id}/${imagen}`);
      setImagenes(imagenes.filter((img) => img !== imagen));
      notify.imageDeleted();
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      notify.error("Error al eliminar", "No se pudo eliminar la imagen.");
    }
  };

  const handleGuardar = async () => {
    if (nuevasImagenes.length === 0) {
      notify.error("Sin archivos", "Seleccioná al menos una imagen para subir.");
      return;
    }

    const formData = new FormData();
    nuevasImagenes.forEach((file) => formData.append("imagenes", file));

    try {
      await axios.post(
        `${API_URL}/api/productos/${id}/imagenes`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      notify.imageUploaded(nuevasImagenes.length);
      setNuevasImagenes([]); // Limpiar previews
      fetchImagenes(); // Recargar imágenes actuales
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      notify.error("Error al subir imágenes", "No se pudieron subir las imágenes.");
    }
  };

  return (
    <main style={{ marginTop: "8%" }}>
      <Navbar />

      <div className="superusuario-container">
        <div className="header-admin">
          <div>
            <h1>
              {loading ? "Cargando producto..." : productoNombre || "Gestión de Imágenes"}
            </h1>
            <p className="admin-section-subtitle">
              Administrá la galería de fotos de este producto
            </p>
          </div>
          <button
            onClick={() => navigate("/adminproductos")}
            className="btn-ir-productos"
            style={{ fontWeight: 600 }}
          >
            ← Volver a Productos
          </button>
        </div>

        <div className="form-container">
          {/* SECCIÓN 1: IMÁGENES ACTUALES */}
          <h2>Fotos Actuales ({imagenes.length})</h2>
          {imagenes.length > 0 ? (
            <div className="imagenes-grid">
              {imagenes.map((img) => (
                <div key={img} className="imagen-item-card">
                  <img
                    src={`${API_URL}/uploads/${img}`}
                    alt={img}
                    className="imagen-preview-lg"
                  />
                  <button
                    className="delete-img-btn"
                    style={{ backgroundColor: "#dc3545", color: "white" }}
                    onClick={() => handleEliminarImagen(img)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-images-msg">
              Este producto aún no tiene fotos cargadas en su galería.
            </p>
          )}

          <hr className="separator" />

          {/* SECCIÓN 2: AGREGAR NUEVAS IMÁGENES */}
          <h2>Agregar nuevas fotos</h2>
          <p className="hint">
            Seleccioná una o más fotos desde tu dispositivo para agregarlas al catálogo.
          </p>

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
              <h3>Fotos a subir ({nuevasImagenes.length})</h3>
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
                      style={{ backgroundColor: "#dc3545", color: "white" }}
                      onClick={() => handleRemoveNewImage(idx)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={handleGuardar}
              style={{ backgroundColor: "#a3e635", color: "#000", fontWeight: "bold" }}
              className="guardar-imagenes-btn"
              disabled={nuevasImagenes.length === 0}
            >
              Subir {nuevasImagenes.length > 0 ? `(${nuevasImagenes.length} fotos)` : "Fotos"}
            </button>

            <button
              onClick={() => navigate("/adminproductos")}
              className="back-btn"
            >
              Volver a Productos
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditarImagenesProducto;
