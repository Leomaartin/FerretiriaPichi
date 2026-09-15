import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "./css/MisCompras.css";

interface PedidoItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: string | number;
  imagenes?: string;
}

interface Pedido {
  id: number;
  usuario_email: string;
  usuario_nombre: string;
  telefono: string;
  direccion?: string;
  mp_payment_id?: string;
  mp_status: string;
  total: string | number;
  fecha: string;
  items: PedidoItem[];
}

const MisCompras: React.FC = () => {
  const [compras, setCompras] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      return;
    }

    const userData = JSON.parse(stored);
    setUser(userData);

    if (userData.email) {
      fetch(`http://localhost:3334/api/historial/${userData.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCompras(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error cargando historial de compras:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "COMPLETADO":
        return <span className="badge-status badge-approved">Aprobado</span>;
      case "pending":
      case "in_process":
        return <span className="badge-status badge-pending">Pendiente</span>;
      case "rejected":
      case "failure":
        return <span className="badge-status badge-rejected">Rechazado</span>;
      default:
        return <span className="badge-status badge-default">{status}</span>;
    }
  };

  const formatearFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <main className="mis-compras-page">
      <Navbar />

      <div className="mis-compras-container">
        <h1 className="mis-compras-title">Mis Compras</h1>

        {!user ? (
          <div className="compras-empty-card">
            <h3>Iniciá sesión para ver tu historial</h3>
            <p>Necesitas iniciar sesión con tu cuenta para ver tus pedidos realizados.</p>
            <a href="/login" className="btn-ir-login">
              Iniciar Sesión
            </a>
          </div>
        ) : loading ? (
          <div className="compras-loading">
            <div className="spinner-border text-secondary" role="status"></div>
            <p>Cargando tus compras...</p>
          </div>
        ) : compras.length === 0 ? (
          <div className="compras-empty-card">
            <h3>Aún no realizaste ninguna compra</h3>
            <p>Descubrí todos nuestros productos en la tienda y hacé tu primer pedido.</p>
            <a href="/" className="btn-ir-tienda">
              Explorar Tienda
            </a>
          </div>
        ) : (
          <div className="compras-list">
            {compras.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-header-left">
                    <span className="pedido-id">Pedido #{pedido.id}</span>
                    <span className="pedido-fecha">{formatearFecha(pedido.fecha)}</span>
                  </div>
                  <div className="pedido-header-right">
                    {getStatusBadge(pedido.mp_status)}
                    <span className="pedido-total">
                      ${Number(pedido.total).toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                <div className="pedido-shipping">
                  <p style={{ margin: "2px 0" }}>
                    <strong>Dirección de entrega:</strong> {pedido.direccion || "No especificada"}
                  </p>
                  {pedido.telefono && (
                    <p style={{ margin: "2px 0", color: "#475569" }}>
                      <strong>Teléfono de contacto:</strong> {pedido.telefono}
                    </p>
                  )}
                </div>

                <div className="pedido-items-container">
                  {pedido.items && pedido.items.length > 0 ? (
                    pedido.items.map((item) => {
                      const primeraImagen = item.imagenes
                        ? item.imagenes.split(",")[0].trim()
                        : null;

                      return (
                        <div key={item.id} className="pedido-item-row">
                          {primeraImagen && (
                            <img
                              src={`http://localhost:3334/uploads/${primeraImagen}`}
                              alt={item.nombre}
                              className="pedido-item-img"
                            />
                          )}
                          <div className="pedido-item-info">
                            <span className="pedido-item-nombre">{item.nombre}</span>
                            <span className="pedido-item-qty">
                              Cantidad: {item.cantidad} x ${Number(item.precio_unitario).toLocaleString("es-AR")}
                            </span>
                          </div>
                          <div className="pedido-item-subtotal">
                            ${(Number(item.precio_unitario) * Number(item.cantidad)).toLocaleString("es-AR")}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-items-text">Sin detalle de productos.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MisCompras;
