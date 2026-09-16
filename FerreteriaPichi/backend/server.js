import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registrarEndpoints from "./database/conexion.js";
import cron from "node-cron";
import { conexion } from "./database/conexion.js";
import path from "path";



dotenv.config();
const app = express();
const PORT = process.env.PORT || 3334;

// ========================
//    CONFIGURAR CORS
// ========================
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONT_URL, // URL del frontend en producción (EasyPanel)
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ========================
//    MIDDLEWARES
// ========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ========================
//    ENDPOINTS EXISTENTES
// ========================
registrarEndpoints(app);


// ========================
//       RUTA ROOT
// ========================
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// ========================
//       LEVANTAR SERVER
// ========================
app.listen(PORT, () => {
  console.log("🔥 Servidor corriendo en puerto " + PORT);
});
