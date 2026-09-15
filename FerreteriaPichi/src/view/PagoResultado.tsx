import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PagoResultado: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");

  useEffect(() => {
    // Si el pago fue exitoso, limpiamos el carrito local
    if (status === "success" || status === "approved") {
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }, [status]);

  const isSuccess = status === "success" || status === "approved";
  const isPending = status === "pending";

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Navbar />

      <div
        style={{
          maxWidth: "600px",
          margin: "120px auto 40px",
          padding: "32px 24px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {isSuccess ? (
          <>
            <div
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a" }}>
              ¡Muchas gracias por tu compra!
            </h1>
            <p style={{ color: "#475569", marginTop: "12px", lineHeight: "1.6" }}>
              Tu pago fue procesado exitosamente. Te enviamos el comprobante y detalle de los productos a tu correo electrónico.
            </p>
          </>
        ) : isPending ? (
          <>
            <div
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: "#fef9c3",
                color: "#ca8a04",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 16px",
              }}
            >
              ⏳
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a" }}>
              Pago en proceso
            </h1>
            <p style={{ color: "#475569", marginTop: "12px", lineHeight: "1.6" }}>
              Tu pago se encuentra pendiente de acreditación. Apenas se apruebe, recibirás la confirmación en tu correo.
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 16px",
              }}
            >
              ✕
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0f172a" }}>
              El pago no pudo completarse
            </h1>
            <p style={{ color: "#475569", marginTop: "12px", lineHeight: "1.6" }}>
              Hubo un problema al procesar el pago o fue cancelado. Podés intentar nuevamente desde tu carrito.
            </p>
          </>
        )}

        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/miscompras")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#A3E635",
              color: "#0f172a",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Ver mis compras
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </main>
  );
};

export default PagoResultado;
