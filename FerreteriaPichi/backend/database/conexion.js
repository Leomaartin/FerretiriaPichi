import dotenv from "dotenv";
import pg from "pg";
import { upload } from "./middleware/upload.js";
import registrarMercadoPago from "./controller/MercadoPago.js";

dotenv.config();

const { Pool } = pg;

// ======================================================
// CONEXIÓN POSTGRESQL
// ======================================================

export const conexion = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = conexion;

// Verificación de conexión
conexion
  .connect()
  .then(async (connection) => {
    console.log("🟢 Conectado a PostgreSQL");

    const result = await connection.query(`
      SELECT current_database(), current_user
    `);

    console.log("📌 BASE ACTUAL:", result.rows[0]);

    const tablas = await connection.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("📋 TABLAS:", tablas.rows);

    // Crear columna mostrar_inicio si no existe
    await connection.query(`
      ALTER TABLE productos
      ADD COLUMN IF NOT EXISTS mostrar_inicio INTEGER DEFAULT 0
    `);
    console.log("✅ Columna mostrar_inicio verificada/creada");

    // Crear tablas de pedidos si no existen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        usuario_email VARCHAR(255),
        usuario_nombre VARCHAR(255),
        telefono VARCHAR(50),
        direccion VARCHAR(255),
        mp_payment_id VARCHAR(100),
        mp_status VARCHAR(50) DEFAULT 'pending',
        total NUMERIC(10,2),
        fecha TIMESTAMP DEFAULT NOW()
      )
    `);
    await connection.query(`
      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion VARCHAR(255)
    `);
    await connection.query(`
      ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_entrega VARCHAR(50) DEFAULT 'envio'
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pedido_items (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER,
        nombre VARCHAR(255),
        cantidad INTEGER,
        precio_unitario NUMERIC(10,2)
      )
    `);
    console.log("✅ Tablas pedidos y pedido_items verificadas/creadas");

    connection.release();
  })
  .catch((err) => {
    console.error("❌ Error al conectar a PostgreSQL:", err);
  });

// ======================================================
// REGISTRO DE TODOS LOS ENDPOINTS
// ======================================================

export default function registrarEndpoints(app) {

  // ====================================================
  // MERCADO PAGO (checkout, webhook, historial)
  // ====================================================

  registrarMercadoPago(app, db);

  // ====================================================
  // GET PRODUCTOS
  // ====================================================

  app.get("/api/productos", async (req, res) => {


    try {

      const SQL_QUERY = `
    SELECT
      p.id,
      p.nombre,
      p.descripcion,
      p.precio,
      p.id_categoria,
      p.stock,
      p.mostrar,
      p.mostrar_inicio,
      p.precioenoferta,
      STRING_AGG(i.imagen, ',') AS imagenes
    FROM productos p
    LEFT JOIN imagenes i
      ON p.id = i.producto_id
    GROUP BY p.id
  `;

      const result =
        await db.query(SQL_QUERY);

      const productosConImagenes =
        result.rows.map((prod) => ({

          ...prod,

          imagenes:
            prod.imagenes
              ? prod.imagenes.split(",")
              : [],

        }));

      return res.json(
        productosConImagenes
      );

    } catch (err) {

      console.error(
        "Error obteniendo productos:",
        err
      );

      return res.status(500).json({
        error: "Error en el servidor"
      });
    }

  });

  // ====================================================
  // GET CATEGORÍAS
  // ====================================================

  app.get("/api/categoria", async (req, res) => {

    try {

      const result =
        await db.query(
          "SELECT * FROM categoria"
        );

      return res.json(
        result.rows
      );

    } catch (err) {

      console.error(
        "Error obteniendo categorías:",
        err
      );

      return res.status(500).json({
        error: "Error en el servidor"
      });
    }

  });

  // ====================================================
  // DETALLE PRODUCTO
  // ====================================================

  app.get(
    "/api/detalleproducto/:id",
    async (req, res) => {

      const { id } = req.params;

      try {

        const result =
          await db.query(
            `
        SELECT
          p.*,
          STRING_AGG(i.imagen, ',') AS imagenes
        FROM productos p
        LEFT JOIN imagenes i
          ON p.id = i.producto_id
        WHERE p.id = $1
        GROUP BY p.id
        `,
            [id]
          );

        if (result.rows.length === 0) {

          return res.status(404).json({
            error: "Producto no encontrado"
          });

        }

        const producto = {

          ...result.rows[0],

          imagenes:
            result.rows[0].imagenes
              ? result.rows[0].imagenes.split(",")
              : [],

        };

        return res.json([
          producto
        ]);

      } catch (err) {

        console.error(
          "Error obteniendo producto:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }

  );

  // ====================================================
  // PRODUCTOS POR CATEGORÍA
  // ====================================================

  app.post(
    "/api/categorias/:id",
    async (req, res) => {

      const { id } = req.params;

      try {

        const result =
          await db.query(
            `
        SELECT
          p.id,
          p.nombre,
          p.descripcion,
          p.precio,
          p.id_categoria,
          p.stock,
          p.mostrar,
          p.mostrar_inicio,
          p.precioenoferta,
          STRING_AGG(i.imagen, ',') AS imagenes
        FROM productos p
        LEFT JOIN imagenes i
          ON p.id = i.producto_id
        WHERE p.id_categoria = $1
        GROUP BY p.id
        `,
            [id]
          );

        const productosConImagenes =
          result.rows.map((prod) => ({

            ...prod,

            imagenes:
              prod.imagenes
                ? prod.imagenes.split(",")
                : [],

          }));

        return res.json(
          productosConImagenes
        );

      } catch (err) {

        console.error(
          "Error obteniendo productos por categoría:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }


  );

  // ====================================================
  // CREAR PRODUCTO
  // ====================================================

  app.post(
    "/api/productos",
    upload.single("imagen"),
    async (req, res) => {

      const {
        nombre,
        descripcion,
        precio,
        id_categoria,
        stock,
        mostrar,
        mostrar_inicio
      } = req.body;

      const imagen =
        req.file
          ? req.file.filename
          : null;

      const valorMostrar = mostrar === true || mostrar === "true" || mostrar === 1 || mostrar === "1";
      const valorMostrarInicio = mostrar_inicio === true || mostrar_inicio === "true" || mostrar_inicio === 1 || mostrar_inicio === "1" ? 1 : 0;

      try {

        const result =
          await db.query(
            `
        INSERT INTO productos
        (
          nombre,
          descripcion,
          precio,
          id_categoria,
          imagen,
          stock,
          mostrar,
          mostrar_inicio
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING id
        `,
            [
              nombre,
              descripcion,
              precio,
              id_categoria,
              imagen,
              stock,
              valorMostrar,
              valorMostrarInicio
            ]
          );

        return res.json({
          message: "Producto creado",
          id: result.rows[0].id
        });

      } catch (err) {

        console.error(
          "Error creando producto:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }


  );

  // ====================================================
  // ACTUALIZAR PRODUCTO
  // ====================================================

  app.put(
    "/api/productos/:id",
    async (req, res) => {


      const { id } = req.params;

      const {
        nombre,
        descripcion,
        precio,
        id_categoria,
        stock,
        mostrar,
        mostrar_inicio,
        precioenoferta
      } = req.body;

      const valorMostrar = mostrar === true || mostrar === "true" || mostrar === 1 || mostrar === "1";
      const valorMostrarInicio = mostrar_inicio === true || mostrar_inicio === "true" || mostrar_inicio === 1 || mostrar_inicio === "1" ? 1 : 0;

      try {

        await db.query(
          `
      UPDATE productos
      SET
        nombre = $1,
        descripcion = $2,
        precio = $3,
        id_categoria = $4,
        stock = $5,
        mostrar = $6,
        mostrar_inicio = $7,
        precioenoferta = $8
      WHERE id = $9
      `,
          [
            nombre,
            descripcion,
            precio,
            id_categoria,
            stock,
            valorMostrar,
            valorMostrarInicio,
            precioenoferta,
            id
          ]
        );

        return res.json({
          message: "Producto actualizado"
        });

      } catch (err) {

        console.error(
          "Error actualizando producto:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }

  );

  // ====================================================
  // ELIMINAR PRODUCTO
  // ====================================================

  app.delete(
    "/api/productos/:id",
    async (req, res) => {

      const { id } = req.params;

      try {

        await db.query(
          `
      DELETE FROM productos
      WHERE id = $1
      `,
          [id]
        );

        return res.json({
          message: "Producto eliminado"
        });

      } catch (err) {

        console.error(
          "Error eliminando producto:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }


  );

  // ====================================================
  // CREAR CATEGORÍA
  // ====================================================

  app.post(
    "/api/categoria",
    upload.single("imagen"),
    async (req, res) => {


      const { nombre } = req.body;

      const imagen =
        req.file
          ? req.file.filename
          : null;

      if (!nombre) {

        return res.status(400).json({
          error: "El nombre es obligatorio"
        });

      }

      try {

        const result =
          await db.query(
            `
        INSERT INTO categoria
        (
          nombre,
          imagen
        )
        VALUES
        (
          $1,
          $2
        )
        RETURNING id
        `,
            [
              nombre,
              imagen
            ]
          );

        return res.json({
          message: "Categoría creada",
          id: result.rows[0].id
        });

      } catch (err) {

        console.error(
          "Error creando categoría:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }


  );

  // ====================================================
  // ACTUALIZAR CATEGORÍA
  // ====================================================

  app.put(
    "/api/categoria/:id",
    upload.single("imagen"),
    async (req, res) => {


      const { id } = req.params;

      const { nombre } = req.body;

      const imagen =
        req.file
          ? req.file.filename
          : req.body.imagen;

      if (!nombre) {

        return res.status(400).json({
          error: "El nombre es obligatorio"
        });

      }

      try {

        await db.query(
          `
      UPDATE categoria
      SET
        nombre = $1,
        imagen = $2
      WHERE id = $3
      `,
          [
            nombre,
            imagen,
            id
          ]
        );

        return res.json({
          message: "Categoría actualizada"
        });

      } catch (err) {

        console.error(
          "Error actualizando categoría:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }


  );

  // ====================================================
  // ELIMINAR CATEGORÍA
  // ====================================================

  app.delete(
    "/api/categoria/:id",
    async (req, res) => {


      const { id } = req.params;

      try {

        await db.query(
          `
      DELETE FROM categoria
      WHERE id = $1
      `,
          [id]
        );

        return res.json({
          message: "Categoría eliminada"
        });

      } catch (err) {

        console.error(
          "Error eliminando categoría:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }


  );

  // ====================================================
  // OBTENER CATEGORÍA POR ID
  // ====================================================

  app.get(
    "/api/categoria/:id",
    async (req, res) => {

      const { id } = req.params;

      try {

        const result =
          await db.query(
            `
        SELECT *
        FROM categoria
        WHERE id = $1
        `,
            [id]
          );

        return res.json(
          result.rows[0] || null
        );

      } catch (err) {

        console.error(
          "Error obteniendo categoría:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }


  );

  // ====================================================
  // IMÁGENES DE PRODUCTO
  // ====================================================

  app.post(
    "/api/productos/:id/imagenes",
    upload.array("imagenes"),
    async (req, res) => {


      const { id } = req.params;

      const archivos =
        req.files || [];

      try {

        for (const archivo of archivos) {

          await db.query(
            `
        INSERT INTO imagenes
        (
          producto_id,
          imagen
        )
        VALUES
        (
          $1,
          $2
        )
        `,
            [
              id,
              archivo.filename
            ]
          );
        }

        return res.json({
          message: "Imágenes subidas"
        });

      } catch (err) {

        console.error(
          "Error subiendo imágenes:",
          err
        );

        return res.status(500).json({
          error: "Error al subir imágenes"
        });
      }
    }


  );

  // ====================================================
  // ELIMINAR IMAGEN
  // ====================================================

  app.delete(
    "/api/imagenes/:productoId/:imagen",
    async (req, res) => {


      const {
        productoId,
        imagen
      } = req.params;

      try {

        await db.query(
          `
      DELETE FROM imagenes
      WHERE producto_id = $1
      AND imagen = $2
      `,
          [
            productoId,
            imagen
          ]
        );

        return res.json({
          message: "Imagen eliminada"
        });

      } catch (err) {

        console.error(
          "Error eliminando imagen:",
          err
        );

        return res.status(500).json({
          error: "Error al eliminar imagen"
        });
      }
    }


  );

  // ====================================================
  // MOSTRAR PRODUCTO EN HOME
  // ====================================================

  app.post(
    "/api/mostrarproductohome",
    async (req, res) => {


      const {
        mostrar,
        id
      } = req.body;

      try {

        await db.query(
          `
      UPDATE productos
      SET mostrar = $1
      WHERE id = $2
      `,
          [
            mostrar,
            id
          ]
        );

        return res.json({
          success: true,
          mostrar
        });

      } catch (err) {

        console.error(
          "Error actualizando mostrar:",
          err
        );

        return res.status(500).json({
          error: "Error en el servidor"
        });
      }
    }

  );

  // ====================================================
  // ACTUALIZAR MOSTRAR PRODUCTO
  // ====================================================

  app.put(
    "/api/productos/:id/mostrar",
    async (req, res) => {

      const { id } = req.params;

      const { mostrar } = req.body;
      const valorMostrar = mostrar === true || mostrar === "true" || mostrar === 1 || mostrar === "1";

      try {

        await db.query(
          `
      UPDATE productos
      SET mostrar = $1
      WHERE id = $2
      `,
          [
            valorMostrar,
            id
          ]
        );

        return res.json({
          success: true,
          mostrar: valorMostrar
        });

      } catch (err) {

        console.error(
          "Error actualizando mostrar:",
          err
        );

        return res.status(500).json({
          error: "Error al actualizar"
        });
      }
    }


  );

  // ====================================================
  // ACTUALIZAR MOSTRAR AL INICIO
  // ====================================================

  app.put(
    "/api/productos/:id/mostrar-inicio",
    async (req, res) => {

      const { id } = req.params;

      const { mostrar_inicio } = req.body;
      const valorMostrarInicio = mostrar_inicio === true || mostrar_inicio === "true" || mostrar_inicio === 1 || mostrar_inicio === "1" ? 1 : 0;

      try {

        await db.query(
          `
      UPDATE productos
      SET mostrar_inicio = $1
      WHERE id = $2
      `,
          [
            valorMostrarInicio,
            id
          ]
        );

        return res.json({
          success: true,
          mostrar_inicio: valorMostrarInicio
        });

      } catch (err) {

        console.error(
          "Error actualizando mostrar_inicio:",
          err
        );

        return res.status(500).json({
          error: "Error al actualizar mostrar_inicio"
        });
      }
    }


  );

  // ====================================================
  // GUARDAR USUARIO
  // ====================================================

  app.post(
    "/api/guardarusuario",
    async (req, res) => {


      const {
        google_id,
        nombre,
        email,
        foto
      } = req.body;

      console.log(
        "📩 [REQ] Datos recibidos desde el frontend:"
      );

      console.log({
        google_id,
        nombre,
        email,
        foto
      });

      if (!google_id || !email) {

        console.log(
          "❌ Datos incompletos, falta google_id o email"
        );

        return res.status(400).json({
          error: "Datos incompletos"
        });
      }

      try {

        // ----------------------------------------------
        // VERIFICAR SI EL USUARIO EXISTE
        // ----------------------------------------------

        console.log(
          "🔍 Consultando si el usuario ya existe en la BD..."
        );

        const resultados =
          await db.query(
            `
        SELECT *
        FROM usuarios
        WHERE google_id = $1
           OR email = $2
        `,
            [
              google_id,
              email
            ]
          );

        // ----------------------------------------------
        // SI YA EXISTE
        // ----------------------------------------------

        if (resultados.rows.length > 0) {

          console.log(
            "✔ Usuario encontrado en BD, no se crea nuevo:"
          );

          console.log(
            resultados.rows[0]
          );

          return res.status(200).json({

            message:
              "Usuario ya registrado",

            user:
              resultados.rows[0]

          });
        }

        // ----------------------------------------------
        // CREAR USUARIO
        // ----------------------------------------------

        console.log(
          "🆕 Usuario NO existe, creando uno nuevo..."
        );

        const result =
          await db.query(
            `
        INSERT INTO usuarios
        (
          google_id,
          nombre,
          email,
          foto
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING id
        `,
            [
              google_id,
              nombre,
              email,
              foto
            ]
          );

        console.log(
          "🎉 Usuario creado correctamente en la BD. ID:",
          result.rows[0].id
        );

        return res.status(201).json({

          message:
            "Usuario creado",

          user: {
            id: result.rows[0].id,
            google_id,
            nombre,
            email,
            foto
          }

        });

      } catch (err) {

        console.error(
          "❌ Error guardando usuario:",
          err
        );

        return res.status(500).json({
          error: "Error insertando usuario"
        });
      }
    }

  );

  // ====================================================
  // MOSTRAR USUARIO
  // ====================================================

  app.post(
    "/api/mostrarusuario",
    async (req, res) => {

      const { email } = req.body;

      if (!email) {

        return res.status(400).json({
          error: "Email requerido"
        });

      }

      try {

        const result =
          await db.query(
            `
        SELECT
          nombre,
          email,
          foto
        FROM usuarios
        WHERE email = $1
        LIMIT 1
        `,
            [email]
          );

        if (result.rows.length === 0) {

          return res.status(404).json({
            error: "Usuario no encontrado"
          });

        }

        const user =
          result.rows[0];

        return res.json({

          message:
            "Usuario obtenido",

          user

        });

      } catch (err) {

        console.error(
          "Error consultando usuario:",
          err
        );

        return res.status(500).json({
          error: "Error consultando BD"
        });
      }
    }


  );

}
