import { GoogleLogin } from "@react-oauth/google";

const GoogleButton = () => {
  // Funcion que llama al backend
  const loginWithGoogleBackend = async (credential: string) => {
    try {
      const res = await fetch("http://localhost:3334/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        throw new Error("Error en el backend");
      }

      return await res.json();
    } catch (err) {
      console.error("❌ Error llamando al backend:", err);
      throw err;
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <GoogleLogin
        onSuccess={async (response) => {
          console.log("🟩 Google respondió:", response);

          const credential = response?.credential;

          if (!credential) {
            console.error("❌ Google no devolvió credential");
            return;
          }

          try {
            const data = await loginWithGoogleBackend(credential);

            console.log("🟦 Usuario logueado:", data);

            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            alert("Login con Google exitoso!");
          } catch (err) {
            console.error("❌ Error procesando login:", err);
          }
        }}
        onError={() => console.log("❌ Error en Google Login")}
      />
    </div>
  );
};

export default GoogleButton;
