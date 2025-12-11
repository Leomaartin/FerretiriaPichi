import React from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast, { Toaster } from "react-hot-toast";
import jwt_decode from "jwt-decode";

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}
const handleSubmitGoogle = async (googleUser: GoogleUser) => {
  try {
    const response = await fetch("http://localhost:3334/api/guardarusuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        google_id: googleUser.email, // o decoded.sub si lo tenés
        nombre: googleUser.name,
        email: googleUser.email,
        foto: googleUser.picture
      }),
    });

    const data = await response.json();
    console.log("Usuario guardado/recuperado:", data);
  } catch (error) {
    console.error("Error al guardar info del usuario:", error);
  }
};

function Login() {
  const navigate = useNavigate();

  const onGoogleSuccess = async (response: any) => {
  try {
    if (!response.credential) throw new Error("No se recibió credential");

    const decoded: any = jwt_decode(response.credential);

    const user: GoogleUser = {
      name: decoded.name || "Usuario",
      email: decoded.email || "sin-email@example.com",
      picture: decoded.picture || "/default-user.png",
    };

    // Guardar en localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Guardar o verificar en backend
    await handleSubmitGoogle(user);

    toast.success("¡Login con Google exitoso!");
    navigate("/");
  } catch (error) {
    console.error("Error decodificando JWT:", error);
    toast.error("Error procesando los datos de Google");
  }
};
  const onGoogleError = () => {
    console.log("Algo salió mal con Google");
    toast.error("Error en login con Google");
  };

  return (
    <main className="bg-light min-vh-100" style={{ marginTop: "-1%" }}>
      <Toaster position="top-right" />
      <header>
        <Navbar />
      </header>

      <div className="d-flex justify-content-center align-items-center min-vh-100 p-3">
        <div
          className="card p-4 shadow-lg border-0"
          style={{
            maxWidth: "450px",
            width: "100%",
            borderRadius: "1rem",
          }}
        >
          <h3 className="text-center" style={{ color: "#a3e635" }}>
            Iniciar Sesión con Google
          </h3>

          <div
            className="d-flex justify-content-center"
            style={{ marginTop: "10%" }}
          >
            <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
