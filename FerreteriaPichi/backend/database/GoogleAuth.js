import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { db } from "./conexion.js"; // usar db.promise() o conexión pool

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential)
    return res.status(400).json({ error: "No se envió credential" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Buscar usuario
    const [result] = await db.query("SELECT * FROM usuarios WHERE email=?", [
      email,
    ]);
    let usuario = result[0];

    if (!usuario) {
      const [insert] = await db.query(
        "INSERT INTO usuarios (nombre, email, foto, google_id) VALUES (?, ?, ?, ?)",
        [name, email, picture, sub]
      );
      usuario = {
        id: insert.insertId,
        nombre: name,
        email,
        foto: picture,
        google_id: sub,
      };
    }

    // Crear JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({ token, usuario });
  } catch (error) {
    console.error("❌ Error en GoogleAuth:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
});

export default router;
