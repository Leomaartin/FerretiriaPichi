import React from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast, { Toaster } from "react-hot-toast";
import jwt_decode from "jwt-decode"; // ✅ Import ESM

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

function Login() {
  const navigate = useNavigate();

  const onGoogleSuccess = (response: any) => {
    try {
      if (!response.credential) throw new Error("No se recibió credential");

      const decoded: any = jwt_decode(response.credential);

      const user: GoogleUser = {
        name: decoded.name || "Usuario",
        email: decoded.email || "sin-email@example.com",
        picture: decoded.picture || "/default-user.png",
      };

      localStorage.setItem("user", JSON.stringify(user));

      toast.success("¡Login con Google exitoso!");
      navigate("/"); // Redirige al home
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
