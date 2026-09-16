// Configuración central de la URL del backend.
// En desarrollo usa localhost:3334.
// En producción (EasyPanel), definí VITE_API_URL en las env vars del servicio.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3334";

export default API_URL;
