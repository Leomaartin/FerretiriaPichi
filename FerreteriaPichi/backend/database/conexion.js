import mysql from "mysql2";
import dotenv from "dotenv";
import { upload } from "./middleware/upload.js";
import express from "express";

import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
dotenv.config();

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
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
  app.post("/api/checkout", async (req, res) => {
    console.log("💡 Entró al endpoint /api/checkout");

    try {
      const { items, nombre, telefono, gmail } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Carrito vacío" });
      }

      const phoneNumber = Number(telefono) || 11111111;

      // ===============================
      // Crear Preferencia v2
      // ===============================
      const preference = new Preference(client);

      const body = {
        items: items.map((p) => ({
          id: p.id,
          title: p.nombre,
          quantity: Number(p.cantidad),
          unit_price: Number(p.precio),
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

        notification_url:
          "https://interbranchial-momentously-helga.ngrok-free.dev/api/webhook-mp",

        binary_mode: true,
      };

      const response = await preference.create({ body });

      console.log("✅ Preferencia creada con éxito");

      return res.json({
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      });
    } catch (error) {
      console.error("🔥 ERROR en /api/checkout:", error);
      res.status(500).json({ error: "Error creando preferencia" });
    }
  });
  // ===============================================
  //   ✔️ WEBHOOK MERCADO PAGO (SDK NUEVO v2)
  // ===============================================

  app.post("/api/webhook-mp", async (req, res) => {
    console.log("📩 Webhook recibido:", req.body);

    try {
      const { type, data } = req.body;

      if (type === "payment") {
        const paymentId = data.id;

        const paymentClient = new Payment(client);

        const payment = await paymentClient.get({ id: paymentId });

        console.log("💰 Pago consultado:", payment);

        if (payment.status === "approved") {
          const items = payment.additional_info.items;

          for (const item of items) {
            const productId = item.id;
            const quantity = item.quantity;

            await db.query(
              "UPDATE productos SET stock = stock - ? WHERE id = ?",
              [quantity, productId]
            );
          }

          console.log("📦 Stock actualizado correctamente");
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("🔥 Error en webhook:", error);
      res.sendStatus(500);
    }
  });

  app.get("/success", (req, res) => {
    res.send("🎉 Pago aprobado! Gracias por tu compra.");
  });

  app.get("/failure", (req, res) => {
    res.send("❌ Hubo un error con el pago.");
  });

  app.get("/pending", (req, res) => {
    res.send("⏳ Tu pago está pendiente.");
  });
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
        p.mostrar,
        p.precioenoferta,
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
  app.put("/api/productos/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, id_categoria, stock, precioenoferta } =
      req.body;

    try {
      await db.query(
        "UPDATE productos SET nombre=?, descripcion=?, precio=?, id_categoria=?, stock=?, precioenoferta=? WHERE id=?",
        [nombre, descripcion, precio, id_categoria, stock, precioenoferta, id]
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

  app.post("/api/mostrarproductohome", (req, res) => {
    const { mostrar, id } = req.body;
    const SQL_QUERY = `
      UPDATE
       mostrar=?
  WHERE id = ?
    `;

    conexion.query(SQL_QUERY, [mostarar, id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
    });
  });
  app.put("/api/productos/:id/mostrar", (req, res) => {
    const { id } = req.params;
    const { mostrar } = req.body;

    const SQL = "UPDATE productos SET mostrar = ? WHERE id = ?";
    conexion.query(SQL, [mostrar, id], (err, result) => {
      if (err) return res.status(500).json({ error: "Error al actualizar" });

      res.json({ success: true, mostrar });
    });
  });
  app.post("/api/guardarusuario", (req, res) => {
    const { google_id, nombre, email, foto } = req.body;

    console.log("📩 [REQ] Datos recibidos desde el frontend:");
    console.log({ google_id, nombre, email, foto });

    if (!google_id || !email) {
      console.log("❌ Datos incompletos, falta google_id o email");
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const SQL_CHECK = `
    SELECT * FROM usuarios WHERE google_id = ? OR email = ?
  `;

    console.log("🔍 Consultando si el usuario ya existe en la BD...");

    conexion.query(SQL_CHECK, [google_id, email], (err, resultados) => {
      if (err) {
        console.log("❌ Error al consultar usuario:", err);
        return res.status(500).json({ error: "Error consultando usuario" });
      }

      // Si ya existe
      if (resultados.length > 0) {
        console.log("✔ Usuario encontrado en BD, no se crea nuevo:");
        console.log(resultados[0]);

        return res.status(200).json({
          message: "Usuario ya registrado",
          user: resultados[0],
        });
      }

      // Si no existe → crear
      console.log("🆕 Usuario NO existe, creando uno nuevo...");

      const SQL_INSERT = `
      INSERT INTO usuarios (google_id, nombre, email, foto)
      VALUES (?, ?, ?, ?)
    `;

      conexion.query(
        SQL_INSERT,
        [google_id, nombre, email, foto],
        (err, result) => {
          if (err) {
            console.log("❌ Error insertando usuario:", err);
            return res.status(500).json({ error: "Error insertando usuario" });
          }

          console.log(
            "🎉 Usuario creado correctamente en la BD. ID:",
            result.insertId
          );

          return res.status(201).json({
            message: "Usuario creado",
            user: { google_id, nombre, email, foto },
          });
        }
      );
    });
  });
  app.post("/api/mostrarusuario", (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    const SQL =
      "SELECT nombre, email, foto FROM usuarios WHERE email = ? LIMIT 1";

    conexion.query(SQL, [email], (err, resultados) => {
      if (err) {
        console.error("Error consultando usuario:", err);
        return res.status(500).json({ error: "Error consultando BD" });
      }

      if (resultados.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const user = resultados[0];

      return res.json({
        message: "Usuario obtenido",
        user,
      });
    });
  });


}
