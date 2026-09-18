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
  const [filtroEstado, setFiltroEstado] = useState<string>("approved");
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

  // Función para generar y descargar Factura en Excel con toda la información
  const handleGenerarFactura = (pedido: Pedido) => {
    try {
      const fechaFormateada = formatearFecha(pedido.fecha);
      const clienteNombre = pedido.usuario_nombre || "Cliente";
      const totalNum = Number(pedido.total) || 0;

      const itemsHtml = (pedido.items || [])
        .map((item, index) => {
          const cant = Number(item.cantidad) || 1;
          const unit = Number(item.precio_unitario) || 0;
          const sub = cant * unit;
          return `
            <tr>
              <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px;"><strong>${item.nombre}</strong></td>
              <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px;">${cant}</td>
              <td style="border: 1px solid #cbd5e1; text-align: right; padding: 8px;">$ ${unit.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              <td style="border: 1px solid #cbd5e1; text-align: right; font-weight: bold; padding: 8px;">$ ${sub.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
            </tr>
          `;
        })
        .join("");

      const excelTemplate = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Factura #${pedido.id}</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
            .header-title { font-size: 16pt; font-weight: bold; color: #0f172a; }
            .header-sub { font-size: 10pt; color: #475569; font-style: italic; }
            .factura-title { font-size: 13pt; font-weight: bold; background-color: #a3e635; color: #000000; text-align: center; padding: 10px; }
            .section-head { font-size: 11pt; font-weight: bold; background-color: #1e293b; color: #ffffff; padding: 6px; }
            .label-cell { font-weight: bold; color: #334155; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; }
            .val-cell { border: 1px solid #e2e8f0; padding: 6px; }
            .table-th { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 8px; border: 1px solid #0f172a; }
            .total-lbl { font-size: 12pt; font-weight: bold; text-align: right; background-color: #f1f5f9; padding: 10px; }
            .total-val { font-size: 14pt; font-weight: bold; color: #15803d; text-align: right; background-color: #f1f5f9; padding: 10px; }
          </style>
        </head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <tr>
              <td colspan="5" class="header-title">FERRETERÍA CASA MARIO</td>
            </tr>
            <tr>
              <td colspan="5" class="header-sub">De Christian Landi · Av. Gallesio 590, Zárate, Buenos Aires</td>
            </tr>
            <tr><td colspan="5"></td></tr>
            <tr>
              <td colspan="5" class="factura-title">COMPROBANTE DE COMPRA / FACTURA DE PEDIDO</td>
            </tr>
            <tr><td colspan="5"></td></tr>
            <tr>
              <td colspan="2" class="section-head">DATOS DEL PEDIDO</td>
              <td></td>
              <td colspan="2" class="section-head">DATOS DEL CLIENTE</td>
            </tr>
            <tr>
              <td class="label-cell">N° de Pedido:</td>
              <td class="val-cell">#${pedido.id}</td>
              <td></td>
              <td class="label-cell">Cliente:</td>
              <td class="val-cell">${clienteNombre}</td>
            </tr>
            <tr>
              <td class="label-cell">Fecha y Hora:</td>
              <td class="val-cell">${fechaFormateada}</td>
              <td></td>
              <td class="label-cell">Email:</td>
              <td class="val-cell">${pedido.usuario_email || "No registrado"}</td>
            </tr>
            <tr>
              <td class="label-cell">Estado Pago:</td>
              <td class="val-cell">${pedido.mp_status === "approved" ? "Aprobado / Pagado" : pedido.mp_status === "completado" ? "Entregado" : pedido.mp_status}</td>
              <td></td>
              <td class="label-cell">Teléfono:</td>
              <td class="val-cell">${pedido.telefono || "No registrado"}</td>
            </tr>
            <tr>
              <td class="label-cell">ID Mercado Pago:</td>
              <td class="val-cell">${pedido.mp_payment_id || "-"}</td>
              <td></td>
              <td class="label-cell">Dirección de Entrega:</td>
              <td class="val-cell">${pedido.direccion || "Retiro en local / Sin dirección"}</td>
            </tr>
            <tr><td colspan="5"></td></tr>
            <tr>
              <td colspan="5" class="section-head">DETALLE DE PRODUCTOS COMPRADOS</td>
            </tr>
            <tr>
              <th class="table-th" style="width: 50px;">#</th>
              <th class="table-th" style="width: 320px; text-align: left;">Producto</th>
              <th class="table-th" style="width: 90px;">Cantidad</th>
              <th class="table-th" style="width: 140px; text-align: right;">Precio Unitario</th>
              <th class="table-th" style="width: 150px; text-align: right;">Subtotal</th>
            </tr>
            ${itemsHtml}
            <tr>
              <td colspan="3"></td>
              <td class="total-lbl">TOTAL GENERAL:</td>
              <td class="total-val">$ ${totalNum.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr><td colspan="5"></td></tr>
            <tr>
              <td colspan="5" style="text-align: center; font-size: 9pt; color: #64748b; padding: 12px;">
                Factura emitida automáticamente desde el Panel de Administración de Ferretería Casa Mario
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob(["\uFEFF" + excelTemplate], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanName = clienteNombre.replace(/[^a-zA-Z0-9]/g, "_");
      link.href = url;
      link.setAttribute("download", `Factura_Pedido_${pedido.id}_${cleanName}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Factura en Excel del Pedido #${pedido.id} generada correctamente`);
    } catch (error) {
      console.error("Error al generar factura:", error);
      toast.error("Error al generar el archivo de factura");
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
                className={`filter-tab ${filtroEstado === "approved" ? "active" : ""}`}
                onClick={() => setFiltroEstado("approved")}
              >
                <i className="fa-solid fa-circle-check"></i> Aprobados
              </button>
              <button
                className={`filter-tab ${filtroEstado === "completado" ? "active" : ""}`}
                onClick={() => setFiltroEstado("completado")}
              >
                <i className="fa-solid fa-truck-ramp-box"></i> Entregados
              </button>
              <button
                className={`filter-tab ${filtroEstado === "todos" ? "active" : ""}`}
                onClick={() => setFiltroEstado("todos")}
              >
                <i className="fa-solid fa-list-ul"></i> Todos
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
                {filtroEstado === "approved"
                  ? "No hay pedidos aprobados en este momento."
                  : filtroEstado === "completado"
                  ? "No hay pedidos entregados en este momento."
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
                            <option value="approved">Aprobado</option>
                            <option value="completado">Entregado</option>
                            <option value="pending">Pendiente</option>
                            <option value="rejected">Cancelado</option>
                          </select>
                        </div>

                        <div className="admin-card-buttons">
                          {/* BOTÓN GENERAR FACTURA EN EXCEL */}
                          <button
                            className="btn-generar-factura"
                            onClick={() => handleGenerarFactura(pedido)}
                            title="Descargar Factura del Pedido en Excel"
                          >
                            <i className="fa-solid fa-file-excel"></i> Generar Factura
                          </button>

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
