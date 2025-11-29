import "./css/Carrito.css";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

interface CarritoItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

const Carrito: React.FC = () => {
  const [items, setItems] = useState<CarritoItem[]>([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [gmail, setGmail] = useState("");

  useEffect(() => {
    const storedCart = localStorage.getItem("carrito");
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items));
  }, [items]);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calcularSubtotal = (item: CarritoItem) => item.precio * item.cantidad;
  const total = items.reduce((acc, item) => acc + calcularSubtotal(item), 0);

  const handleFinalizar = () => {
    setShowCheckoutForm(true);
  };

  const handleIrAPagar = async () => {
    console.log("📤 [FRONT] Mandando carrito al backend...");

    try {
      const response = await fetch("http://localhost:3334/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          nombre,
          telefono,
          gmail,
        }),
      });

      const data = await response.json();

      console.log("📥 [FRONT] Respuesta del backend:", data);

      if (data.init_point) {
        console.log("🔗 Redirigiendo a Mercado Pago:", data.init_point);
        window.location.href = data.init_point;
      } else {
        alert("Error iniciando el pago.");
      }
    } catch (error) {
      console.error("🔥 Error al procesar pago:", error);
    }
  };

  return (
    <main>
      <Navbar />
      <div className="cart-container">
        <h1>Tu Carrito de Compras</h1>

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
            {/* LISTA DE PRODUCTOS */}
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={`http://localhost:3334/uploads/${item.imagen}`}
                    alt={item.nombre}
                    className="cart-item-image"
                  />

                  <div className="item-details">
                    <h3 className="item-name">{item.nombre}</h3>
                    <p className="item-price">
                      Precio unitario: ${item.precio.toFixed(2)}
                    </p>

                    {/* BOTÓN ELIMINAR AHORA ES UN ICONO DE PAPELERA */}
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
                    ${calcularSubtotal(item).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* RESUMEN */}
            <div className="cart-summary">
              <h2>Resumen del Pedido</h2>

              <div className="summary-row">
                <span>
                  Subtotal (
                  {items.reduce((sum, item) => sum + item.cantidad, 0)} ítems):
                </span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="summary-row total-row">
                <strong>Total (Con envío):</strong>
                <strong>${(total * 1.21).toFixed(2)}</strong>
              </div>

              {!showCheckoutForm && (
                <button className="checkout-btn" onClick={handleFinalizar}>
                  Finalizar Compra
                </button>
              )}

              {showCheckoutForm && (
                <div className="checkout-form">
                  <h3>Datos para finalizar la compra</h3>

                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Número de teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />

                  <input
                    type="email"
                    placeholder="Correo Gmail"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                  />

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
