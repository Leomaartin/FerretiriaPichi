// AdminMenu.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/AdminMenu.css";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { useConfirm } from "../components/ConfirmModal/ConfirmContext";
import API_URL from "../config/api";

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

const AdminMenu: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("pending");
  const [busqueda, setBusqueda] = useState<string>("");
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const url =
        filtroEstado === "todos"
          ? `${API_URL}/api/admin/pedidos`
          : `${API_URL}/api/admin/pedidos?status=${filtroEstado}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPedidos(data);
      }
    } catch (err) {
      console.error("Error obteniendo pedidos:", err);
      toast.error("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [filtroEstado]);

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/pedidos/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nuevoEstado }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Estado del pedido #${id} actualizado`);
        fetchPedidos();
      } else {
        toast.error("Error al actualizar el estado");
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      toast.error("Error en la conexión");
    }
  };

  const handleEliminarPedido = async (id: number) => {
    const confirmed = await confirm({
      title: "¿Eliminar Pedido?",
      message: `¿Estás seguro de que deseás eliminar el pedido #${id}?`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/pedidos/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success(`Pedido #${id} eliminado`);
        fetchPedidos();
      } else {
        toast.error("Error al eliminar pedido");
      }
    } catch (err) {
      console.error("Error eliminando pedido:", err);
      toast.error("Error en la conexión");
    }
  };

  const toggleDetalle = (id: number) => {
    setPedidoExpandido(pedidoExpandido === id ? null : id);
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const term = busqueda.toLowerCase();
    const matchId = String(p.id).includes(term);
    const matchNombre = (p.usuario_nombre || "").toLowerCase().includes(term);
    const matchEmail = (p.usuario_email || "").toLowerCase().includes(term);
    const matchTel = (p.telefono || "").toLowerCase().includes(term);
    return matchId || matchNombre || matchEmail || matchTel;
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="admin-badge badge-approved">Aprobado</span>;
      case "pending":
      case "in_process":
        return <span className="admin-badge badge-pending">Pendiente</span>;
      case "completado":
        return <span className="admin-badge badge-completed">Entregado</span>;
      case "rejected":
      case "failure":
      case "cancelado":
        return <span className="admin-badge badge-rejected">Cancelado</span>;
      default:
        return <span className="admin-badge badge-default">{status}</span>;
    }
  };

  return (
    <main className="admin-main-container">
      <Navbar />

      <div className="admin-content-wrapper">
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">Panel de Administración</h1>
            <p className="admin-subtitle">Gestión de productos, categorías y pedidos</p>
          </div>

          <div className="admin-quick-actions">
            <button
              className="admin-nav-btn btn-prod"
              onClick={() => navigate("/adminproductos")}
            >
              Administrar Productos
            </button>
            <button
              className="admin-nav-btn btn-cat"
              onClick={() => navigate("/admincategorias")}
            >
              Administrar Categorías
            </button>
          </div>
        </div>

        {/* SECCIÓN GESTIÓN DE PEDIDOS */}
        <section className="admin-pedidos-section">
          <div className="pedidos-section-header">
            <h2>Control de Pedidos</h2>

            {/* BOTONES DE FILTRO */}
            <div className="pedidos-filter-tabs">
              <button
                className={`filter-tab ${filtroEstado === "pending" ? "active" : ""}`}
                onClick={() => setFiltroEstado("pending")}
              >
                Pendientes
              </button>
              <button
                className={`filter-tab ${filtroEstado === "approved" ? "active" : ""}`}
                onClick={() => setFiltroEstado("approved")}
              >
                Aprobados
              </button>
              <button
                className={`filter-tab ${filtroEstado === "todos" ? "active" : ""}`}
                onClick={() => setFiltroEstado("todos")}
              >
                Todos
              </button>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <div className="pedidos-search-bar">
            <input
              type="text"
              placeholder="Buscar por ID, nombre, email o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn-refresh" onClick={fetchPedidos}>
              Actualizar
            </button>
          </div>

          {/* LISTADO DE PEDIDOS */}
          {loading ? (
            <div className="admin-loading">
              <div className="spinner-border text-secondary" role="status"></div>
              <p>Cargando pedidos...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="admin-empty-card">
              <h3>No hay pedidos para mostrar</h3>
              <p>
                {filtroEstado === "pending"
                  ? "No hay pedidos pendientes en este momento."
                  : "No se encontraron pedidos con el filtro actual."}
              </p>
            </div>
          ) : (
            <div className="admin-pedidos-list">
              {pedidosFiltrados.map((pedido) => {
                const expandido = pedidoExpandido === pedido.id;

                return (
                  <div key={pedido.id} className="admin-pedido-card">
                    <div className="admin-pedido-summary">
                      <div className="admin-pedido-info-main">
                        <div className="admin-pedido-id-row">
                          <span className="admin-pedido-id">Pedido #{pedido.id}</span>
                          {getStatusBadge(pedido.mp_status)}
                          <span className="admin-pedido-fecha">
                            {formatearFecha(pedido.fecha)}
                          </span>
                        </div>

                        <div className="admin-cliente-info">
                          <p>
                            <strong>Cliente:</strong> {pedido.usuario_nombre || "Sin nombre"}
                          </p>
                          <p>
                            <strong>Email:</strong> {pedido.usuario_email || "-"}
                          </p>
                          <p>
                            <strong>Teléfono:</strong> {pedido.telefono || "-"}
                          </p>
                          {pedido.direccion && (
                            <p>
                              <strong>Dirección:</strong> {pedido.direccion}
                            </p>
                          )}
                          {pedido.mp_payment_id && (
                            <p>
                              <strong>ID Pago MP:</strong> {pedido.mp_payment_id}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="admin-pedido-actions-col">
                        <span className="admin-pedido-total-amount">
                          ${Number(pedido.total).toLocaleString("es-AR")}
                        </span>

                        <div className="admin-status-dropdown-group">
                          <label>Estado:</label>
                          <select
                            value={pedido.mp_status}
                            onChange={(e) =>
                              handleCambiarEstado(pedido.id, e.target.value)
                            }
                            className="select-status"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobado</option>
                            <option value="completado">Entregado</option>
                            <option value="rejected">Cancelado</option>
                          </select>
                        </div>

                        <div className="admin-card-buttons">
                          <button
                            className="btn-ver-items"
                            onClick={() => toggleDetalle(pedido.id)}
                          >
                            {expandido ? "Ocultar productos" : `Ver productos (${pedido.items?.length || 0})`}
                          </button>

                          <button
                            className="btn-eliminar-pedido"
                            onClick={() => handleEliminarPedido(pedido.id)}
                            title="Eliminar pedido"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DETALLE EXPANDIBLE DE PRODUCTOS */}
                    {expandido && (
                      <div className="admin-pedido-items-dropdown">
                        <h4>Productos del Pedido #{pedido.id}</h4>
                        {pedido.items && pedido.items.length > 0 ? (
                          <div className="admin-items-table-wrapper">
                            <table className="admin-items-table">
                              <thead>
                                <tr>
                                  <th>Imagen</th>
                                  <th>Producto</th>
                                  <th style={{ textAlign: "center" }}>Cantidad</th>
                                  <th style={{ textAlign: "right" }}>Precio Unitario</th>
                                  <th style={{ textAlign: "right" }}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pedido.items.map((item) => {
                                  const primeraImagen = item.imagenes
                                    ? item.imagenes.split(",")[0].trim()
                                    : null;

                                  return (
                                    <tr key={item.id}>
                                      <td>
                                        {primeraImagen ? (
                                          <img
                                            src={`${API_URL}/uploads/${primeraImagen}`}
                                            alt={item.nombre}
                                            className="admin-item-thumb"
                                          />
                                        ) : (
                                          <span className="no-img-text">Sin foto</span>
                                        )}
                                      </td>
                                      <td>
                                        <strong>{item.nombre}</strong>
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        {item.cantidad}
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        ${Number(item.precio_unitario).toLocaleString("es-AR")}
                                      </td>
                                      <td style={{ textAlign: "right", fontWeight: "bold" }}>
                                        ${(Number(item.precio_unitario) * Number(item.cantidad)).toLocaleString("es-AR")}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted">No hay items registrados para este pedido.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminMenu;
