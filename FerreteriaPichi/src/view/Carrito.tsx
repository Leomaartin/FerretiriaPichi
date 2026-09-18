import "./css/Carrito.css";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import API_URL from "../config/api";

interface CarritoItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

const Carrito: React.FC = () => {
  const [items, setItems] = useState<CarritoItem[]>([]);
  const mounted = React.useRef(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [gmail, setGmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoEntrega, setMetodoEntrega] = useState<"envio" | "retiro">("envio");

  // Cargar carrito desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("carrito");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter(Boolean).map((item: any) => ({
            id: Number(item.id) || Date.now(),
            nombre: String(item.nombre || "Producto"),
            precio: Math.max(0, Number(item.precio) || 0),
            cantidad: Math.max(1, Number(item.cantidad) || 1),
            imagen: item.imagen ? String(item.imagen) : "default.png",
          }));
          setItems(sanitized);
        }
      }
    } catch (e) {
      console.error("Error cargando carrito desde localStorage:", e);
    }
  }, []);

  // Rellenar Gmail si el usuario está logueado
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && typeof user === "object") {
          if (user.email) setGmail(String(user.email));
          if (user.nombre) setNombre(String(user.nombre));
        }
      }
    } catch (e) {
      console.error("Error cargando usuario desde localStorage:", e);
    }
  }, []);

  // Guardar carrito cuando cambien los items (no en el primer render)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    localStorage.setItem("carrito", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [items]);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: Math.max(1, (Number(item.cantidad) || 1) + delta) }
            : item
        )
        .filter((i) => i.cantidad > 0)
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calcularSubtotal = (item: CarritoItem) => {
    const precio = Number(item.precio) || 0;
    const cantidad = Number(item.cantidad) || 1;
    return precio * cantidad;
  };
  const subtotal = items.reduce((acc, item) => acc + calcularSubtotal(item), 0);
  const costoEnvio = metodoEntrega === "envio" ? subtotal * 0.21 : 0;
  const totalFinal = subtotal + costoEnvio;

  const handleFinalizar = () => {
    setShowCheckoutForm(true);
  };

  const handleIrAPagar = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre completo es obligatorio.");
      return;
    }

    if (!telefono.trim()) {
      toast.error("El número de teléfono es obligatorio.");
      return;
    }

    if (!gmail.trim()) {
      toast.error("El correo electrónico es obligatorio.");
      return;
    }

    if (metodoEntrega === "envio" && !direccion.trim()) {
      toast.error("La dirección de entrega es obligatoria para envíos a domicilio.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          gmail: gmail.trim(),
          direccion:
            metodoEntrega === "retiro"
              ? "Retiro en sucursal (Ferretería Casa Mario)"
              : direccion.trim(),
          metodo_entrega: metodoEntrega,
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error(data.error || "Error iniciando el pago. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al procesar pago:", error);
      toast.error("Error al conectar con el servidor.");
    }
  };

  return (
    <main>
      <Navbar />

      <div className="cart-container">
        <h1 style={{ marginTop: "10%" }}>Tu Carrito de Compras</h1>

        {items.length === 0 ? (
          <div className="empty-cart-message">
            <p>Tu carrito está vacío. ¡Añade algunos productos!</p>
            <button
              className="continue-shopping-btn"
              onClick={() => (window.location.href = "/")}
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={`${API_URL}/uploads/${item.imagen}`}
                    alt={item.nombre}
                    className="cart-item-image"
                  />

                  <div className="item-details">
                    <h3 className="item-name">{item.nombre}</h3>

                    <p className="item-price">
                      Precio unitario: ${ (Number(item.precio) || 0).toFixed(2) }
                    </p>

                    <button
                      className="remove-item-btn"
                      onClick={() => removeItem(item.id)}
                      aria-label="Eliminar producto"
                    >
                      <i className="fa-regular fa-circle-xmark"></i>
                    </button>
                  </div>

                  <div className="item-quantity-control">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="quantity-btn"
                    >
                      -
                    </button>

                    <span className="item-quantity">{item.cantidad}</span>

                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-subtotal">
                    ${ (calcularSubtotal(item) || 0).toFixed(2) }
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Resumen del Pedido</h2>

              <div className="summary-row">
                <span>
                  Subtotal (
                  {items.reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0)} ítems):
                </span>
                <span>${ (Number(subtotal) || 0).toFixed(2) }</span>
              </div>

              {metodoEntrega === "envio" ? (
                <div className="summary-row">
                  <span>Costo de envío (21%):</span>
                  <span>${ (Number(costoEnvio) || 0).toFixed(2) }</span>
                </div>
              ) : (
                <div className="summary-row">
                  <span>Envío:</span>
                  <span style={{ color: "#16a34a", fontWeight: "bold" }}>Gratis (Retiro en local)</span>
                </div>
              )}

              <div className="summary-row total-row">
                <strong>{metodoEntrega === "envio" ? "Total (Con envío):" : "Total (Retiro en local):"}</strong>
                <strong>${ (Number(totalFinal) || 0).toFixed(2) }</strong>
              </div>

              {!showCheckoutForm && (
                <button className="checkout-btn" onClick={handleFinalizar}>
                  Finalizar Compra
                </button>
              )}

              {showCheckoutForm && (
                <div className="checkout-form">
                  <h3>1. Forma de entrega</h3>

                  <div className="metodo-entrega-selector">
                    <div
                      className={`metodo-entrega-card ${metodoEntrega === "envio" ? "active" : ""}`}
                      onClick={() => setMetodoEntrega("envio")}
                    >
                      <div className="metodo-entrega-radio">
                        <span className={`custom-radio-dot ${metodoEntrega === "envio" ? "checked" : ""}`}></span>
                      </div>
                      <div className="metodo-entrega-icon">🚚</div>
                      <div className="metodo-entrega-info">
                        <h4>Envío a domicilio</h4>
                        <p>Entrega en tu dirección</p>
                      </div>
                    </div>

                    <div
                      className={`metodo-entrega-card ${metodoEntrega === "retiro" ? "active" : ""}`}
                      onClick={() => setMetodoEntrega("retiro")}
                    >
                      <div className="metodo-entrega-radio">
                        <span className={`custom-radio-dot ${metodoEntrega === "retiro" ? "checked" : ""}`}></span>
                      </div>
                      <div className="metodo-entrega-icon">🏪</div>
                      <div className="metodo-entrega-info">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h4>Retiro en local</h4>
                          <span className="badge-gratis">Gratis</span>
                        </div>
                        <p>Casa Mario</p>
                      </div>
                    </div>
                  </div>

                  {metodoEntrega === "retiro" && (
                    <div className="retiro-info-banner">
                      <div className="retiro-info-icon">📍</div>
                      <div>
                        <strong>Punto de retiro:</strong> Ferretería Casa Mario
                        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#475569" }}>
                          Una vez acreditado el pago, podés retirar tu pedido en nuestro local comercial con tu DNI y el comprobante que te llegará por Gmail.
                        </p>
                      </div>
                    </div>
                  )}

                  <h3 style={{ marginTop: "16px" }}>2. Datos del comprador y facturación</h3>

                  <div className="form-group" style={{ marginBottom: "10px" }}>
                    <input
                      type="text"
                      placeholder="Nombre completo *"
                      value={nombre}
                      required
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "10px" }}>
                    <input
                      type="tel"
                      placeholder="Número de teléfono (Obligatorio) *"
                      value={telefono}
                      required
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "10px" }}>
                    <input
                      type="email"
                      placeholder="Correo Gmail (para recibir el comprobante) *"
                      value={gmail}
                      required
                      onChange={(e) => setGmail(e.target.value)}
                    />
                  </div>

                  {metodoEntrega === "envio" && (
                    <div className="form-group" style={{ marginBottom: "14px" }}>
                      <label className="checkout-label">Dirección de entrega *</label>
                      <input
                        type="text"
                        placeholder="Calle, número, piso/depto, barrio, ciudad..."
                        value={direccion}
                        required
                        onChange={(e) => setDireccion(e.target.value)}
                      />
                    </div>
                  )}

                  <button className="checkout-btn" onClick={handleIrAPagar}>
                    Ir a Pagar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Carrito;
