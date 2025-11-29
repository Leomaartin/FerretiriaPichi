import mysql from "mysql2";
import dotenv from "dotenv";
import { upload } from "./middleware/upload.js";
import express from "express";
import googleAuthRouter from "./GoogleAuth.js";
import mercadopago from "mercadopago";
dotenv.config();

// Configurar Mercado Pago clásico
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

// 🔥 Creamos el pool
export const conexion = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  database: process.env.MYSQLDATABASE,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
});

// 🔥 Versión con Promesas
export const db = conexion.promise();

// 🟢 Verificación de conexión
conexion.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
  } else {
    console.log("🟢 Conectado a MySQL");
    connection.release();
  }
});

// ========================================
//   REGISTRO DE TODOS LOS ENDPOINTS
// ========================================
export default function registrarEndpoints(app) {
  // ---------------------------------------
  // GET PRODUCTOS
  // ---------------------------------------
  app.get("/api/productos", (req, res) => {
    const SQL_QUERY = `
      SELECT 
        p.id, 
        p.nombre, 
        p.descripcion, 
        p.precio, 
        p.id_categoria, 
        p.stock,
        GROUP_CONCAT(i.imagen) AS imagenes
      FROM productos p
      LEFT JOIN imagenes i ON p.id = i.producto_id
      GROUP BY p.id
    `;

    conexion.query(SQL_QUERY, (err, result) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });

      const productosConImagenes = result.map((prod) => ({
        ...prod,
        imagenes: prod.imagenes ? prod.imagenes.split(",") : [],
      }));

      res.json(productosConImagenes);
    });
  });

  // ---------------------------------------
  // GET CATEGORÍA
  // ---------------------------------------
  app.get("/api/categoria", (req, res) => {
    const SQL_QUERY = "SELECT * FROM categoria";
    conexion.query(SQL_QUERY, (err, result) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      res.json(result);
    });
  });

  // ---------------------------------------
  // DETALLE PRODUCTO
  // ---------------------------------------
  app.get("/api/detalleproducto/:id", (req, res) => {
    const { id } = req.params;
    const SQL_QUERY = `
      SELECT p.*, GROUP_CONCAT(i.imagen) AS imagenes
      FROM productos p
      LEFT JOIN imagenes i ON p.id = i.producto_id
      WHERE p.id = ?
      GROUP BY p.id
    `;

    conexion.query(SQL_QUERY, [id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });

      if (result.length === 0)
        return res.status(404).json({ error: "Producto no encontrado" });

      const producto = {
        ...result[0],
        imagenes: result[0].imagenes ? result[0].imagenes.split(",") : [],
      };

      res.json([producto]);
    });
  });

  // ---------------------------------------
  // PRODUCTOS POR CATEGORÍA
  // ---------------------------------------
  app.post("/api/categorias/:id", (req, res) => {
    const { id } = req.params;
    const SQL_QUERY = `
      SELECT 
        p.id, 
        p.nombre, 
        p.descripcion, 
        p.precio, 
        p.id_categoria, 
        p.stock,
        GROUP_CONCAT(i.imagen) AS imagenes
      FROM productos p
      LEFT JOIN imagenes i ON p.id = i.producto_id
      WHERE p.id_categoria = ?
      GROUP BY p.id
    `;

    conexion.query(SQL_QUERY, [id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });

      const productosConImagenes = result.map((prod) => ({
        ...prod,
        imagenes: prod.imagenes ? prod.imagenes.split(",") : [],
      }));

      res.json(productosConImagenes);
    });
  });

  // ---------------------------------------
  // CREAR PRODUCTO
  // ---------------------------------------
  app.post("/api/productos", upload.single("imagen"), async (req, res) => {
    const { nombre, descripcion, precio, id_categoria, stock } = req.body;
    const imagen = req.file ? req.file.filename : null;

    try {
      const [result] = await db.query(
        "INSERT INTO productos (nombre, descripcion, precio, id_categoria, imagen, stock) VALUES (?, ?, ?, ?, ?, ?)",
        [nombre, descripcion, precio, id_categoria, imagen, stock]
      );
      res.json({ message: "Producto creado", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // ---------------------------------------
  // ACTUALIZAR PRODUCTO
  // ---------------------------------------
  app.put("/api/productos/:id", upload.single("imagen"), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, id_categoria, stock } = req.body;
    const imagen = req.file ? req.file.filename : req.body.imagen;

    try {
      await db.query(
        "UPDATE productos SET nombre=?, descripcion=?, precio=?, id_categoria=?, imagen=?, stock=? WHERE id=?",
        [nombre, descripcion, precio, id_categoria, imagen, stock, id]
      );
      res.json({ message: "Producto actualizado" });
    } catch (err) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // ---------------------------------------
  // ELIMINAR PRODUCTO
  // ---------------------------------------
  app.delete("/api/productos/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM productos WHERE id=?", [id]);
      res.json({ message: "Producto eliminado" });
    } catch (err) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // ---------------------------------------
  // CRUD CATEGORÍAS
  // ---------------------------------------

  app.post("/api/categoria", upload.single("imagen"), async (req, res) => {
    const { nombre } = req.body;
    const imagen = req.file ? req.file.filename : null;

    if (!nombre)
      return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      const [result] = await db.query(
        "INSERT INTO categoria (nombre, imagen) VALUES (?, ?)",
        [nombre, imagen]
      );
      res.json({ message: "Categoría creada", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  app.put("/api/categoria/:id", upload.single("imagen"), async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const imagen = req.file ? req.file.filename : req.body.imagen;

    if (!nombre)
      return res.status(400).json({ error: "El nombre es obligatorio" });

    try {
      await db.query("UPDATE categoria SET nombre=?, imagen=? WHERE id=?", [
        nombre,
        imagen,
        id,
      ]);
      res.json({ message: "Categoría actualizada" });
    } catch (err) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  app.delete("/api/categoria/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM categoria WHERE id=?", [id]);
      res.json({ message: "Categoría eliminada" });
    } catch (err) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  app.get("/api/categoria/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query("SELECT * FROM categoria WHERE id=?", [
        id,
      ]);
      res.json(result[0] || null);
    } catch (err) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // ---------------------------------------
  // IMÁGENES DE PRODUCTO
  // ---------------------------------------

  app.post(
    "/api/productos/:id/imagenes",
    upload.array("imagenes"),
    async (req, res) => {
      const { id } = req.params;
      const archivos = req.files.map((f) => f.filename);

      try {
        for (let archivo of archivos) {
          await db.query(
            "INSERT INTO imagenes (producto_id, imagen) VALUES (?, ?)",
            [id, archivo]
          );
        }
        res.json({ message: "Imágenes subidas" });
      } catch (err) {
        res.status(500).json({ error: "Error al subir imágenes" });
      }
    }
  );

  app.delete("/api/imagenes/:productoId/:imagen", async (req, res) => {
    const { productoId, imagen } = req.params;
    try {
      await db.query("DELETE FROM imagenes WHERE producto_id=? AND imagen=?", [
        productoId,
        imagen,
      ]);
      res.json({ message: "Imagen eliminada" });
    } catch (err) {
      res.status(500).json({ error: "Error al eliminar imagen" });
    }
  });

  // ========================================
  // ✔️ CHECKOUT MERCADOPAGO (SDK NUEVA)
  // ========================================

  app.post("/api/checkout", async (req, res) => {
    console.log("💡 Entró al endpoint /checkout");

    try {
      const { items, nombre, telefono, gmail } = req.body; // recibimos carrito + datos del comprador

      console.log("📥 Items recibidos del frontend:", items);

      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Carrito vacío" });
      }

      // Convertimos teléfono a número si viene como string
      const phoneNumber = Number(telefono) || 11111111;

      // Creamos la preferencia con los items
      const preference = {
        items: items.map((p) => ({
          id: p.id, // AGREGAR ESTO PARA SABER LUEGO QUÉ PRODUCTO ES
          title: p.nombre,
          unit_price: Number(p.precio),
          quantity: Number(p.cantidad),
          currency_id: "ARS",
        })),
        payer: {
          name: nombre,
          email: gmail,
          phone: {
            area_code: "11",
            number: phoneNumber,
          },
        },
        back_urls: {
          success:
            "https://interbranchial-momentously-helga.ngrok-free.dev/success",
          failure:
            "https://interbranchial-momentously-helga.ngrok-free.dev/failure",
          pending:
            "https://interbranchial-momentously-helga.ngrok-free.dev/pending",
        },
        auto_return: "approved",

        // 🔔 IMPORTANTE: webhook para validar el pago
        notification_url:
          "https://interbranchial-momentously-helga.ngrok-free.dev/api/webhook-mp",

        binary_mode: true,
      };

      console.log("⚙️ Preferencia a enviar a Mercado Pago:", preference);

      // Creamos la preferencia en Mercado Pago
      const response = await mercadopago.preferences.create(preference);

      console.log("✅ Preferencia creada:", response.response);

      // Devolvemos URLs de pago al frontend
      res.json({
        init_point: response.response.init_point,
        sandbox_init_point: response.response.sandbox_init_point,
      });
    } catch (error) {
      console.error("🔥 ERROR creando la preferencia:", error);
      res.status(500).send("Error creando la preferencia");
    }
  });
  app.post("/api/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;

      // Solo nos interesa cuando entra un pago
      if (type === "payment") {
        const paymentId = data.id;

        // Consultamos el pago con Mercado Pago
        const payment = await mercadopago.payment.findById(paymentId);

        if (payment.body.status === "approved") {
          const items = payment.body.additional_info.items;

          for (const item of items) {
            const productId = item.id;
            const quantitySold = item.quantity;

            // 🔥 Actualizar stock en tu base
            await db.query(
              "UPDATE productos SET stock = stock - ? WHERE id = ?",
              [quantitySold, productId]
            );
          }
        }
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Error en webhook:", err);
      res.sendStatus(500);
    }
  });

  app.get("/success", (req, res) => {
    console.log("🎉 PAGO EXITOSO:", req.query);
    res.send("Pago aprobado! Gracias por comprar!");
  });

  app.get("/failure", (req, res) => {
    console.log("❌ PAGO FALLIDO:", req.query);
    res.send("Hubo un error con tu pago.");
  });

  app.get("/pending", (req, res) => {
    console.log("⏳ PAGO PENDIENTE:", req.query);
    res.send("Tu pago está pendiente.");
  });

  // GOOGLE AUTH
  app.use("/api/auth", googleAuthRouter);
}
