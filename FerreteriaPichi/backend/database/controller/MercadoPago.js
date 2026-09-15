import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

dotenv.config();

// ======================================================
// CLIENTE MERCADO PAGO (SDK v2)
// ======================================================

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
});

// ======================================================
// TRANSPORTE NODEMAILER (Gmail)
// ======================================================

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NOTIFY_EMAIL_USER,
    pass: process.env.NOTIFY_EMAIL_PASS,
  },
});

// ======================================================
// FUNCIÓN: ENVIAR EMAIL AL DUEÑO
// ======================================================

// ======================================================
// FUNCIÓN: ENVIAR EMAIL AL DUEÑO
// ======================================================

async function emailDueno(pago, items, pedidoId, pedidoBD) {
  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.nombre}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${i.cantidad}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${Number(i.precio_unitario).toLocaleString("es-AR")}</td>
        </tr>`
    )
    .join("");

  const total = items.reduce(
    (acc, i) => acc + Number(i.precio_unitario) * Number(i.cantidad),
    0
  );

  const clienteNombre = pedidoBD?.usuario_nombre || `${pago.payer?.first_name || ""} ${pago.payer?.last_name || ""}`.trim() || "Cliente";
  const clienteEmail = pedidoBD?.usuario_email || pago.payer?.email || "-";
  const clienteTel = pedidoBD?.telefono || pago.payer?.phone?.number || "-";
  const direccionEntrega = pedidoBD?.direccion || "Retiro en sucursal / A coordinar";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eaeaea;">
      <div style="background:#1a1a2e;padding:24px;text-align:center;">
        <h1 style="color:#A3E635;margin:0;font-size:24px;">🛒 ¡Nuevo Pedido Confirmado!</h1>
        <p style="color:#ccc;margin:6px 0 0;font-size:14px;">Ferretería Casa Mario / Pichi</p>
      </div>
      <div style="padding:24px;">
        <h2 style="color:#333;margin-top:0;font-size:18px;">Detalle del Pedido #${pedidoId}</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <thead>
            <tr style="background:#f4f4f5;color:#333;">
              <th style="padding:8px 12px;text-align:left;border-radius:4px 0 0 4px;">Producto</th>
              <th style="padding:8px 12px;text-align:center;">Cantidad</th>
              <th style="padding:8px 12px;text-align:right;border-radius:0 4px 4px 0;">Precio unit.</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="text-align:right;font-size:20px;font-weight:bold;color:#1a1a2e;margin-top:16px;">
          Total Pagado: $${total.toLocaleString("es-AR")}
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <h3 style="color:#1a1a2e;margin-bottom:10px;font-size:16px;">👤 Datos del Comprador</h3>
        <p style="margin:4px 0;color:#555;"><strong>Nombre:</strong> ${clienteNombre}</p>
        <p style="margin:4px 0;color:#555;"><strong>Email:</strong> ${clienteEmail}</p>
        <p style="margin:4px 0;color:#555;"><strong>Teléfono:</strong> ${clienteTel}</p>
        <p style="margin:4px 0;color:#555;"><strong>Dirección de entrega:</strong> ${direccionEntrega}</p>
        <p style="margin:4px 0;color:#555;"><strong>ID de Pago MP:</strong> ${pago.id}</p>
        <p style="margin:4px 0;color:#555;"><strong>Estado del Pago:</strong> <span style="color:#16a34a;font-weight:bold;">✅ ${pago.status}</span></p>
      </div>
    </div>
  `;

  if (
    !process.env.NOTIFY_EMAIL_USER ||
    !process.env.NOTIFY_EMAIL_PASS ||
    process.env.NOTIFY_EMAIL_PASS.includes("xxxx")
  ) {
    console.warn("⚠️ Nodemailer: Debes configurar tu Contraseña de Aplicación de 16 letras de Google en NOTIFY_EMAIL_PASS (.env) para enviar el correo al dueño.");
    return;
  }

  await mailTransporter.sendMail({
    from: `"Ferretería Casa Mario 🔧" <${process.env.NOTIFY_EMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL_OWNER || process.env.NOTIFY_EMAIL_USER,
    subject: `✅ Nuevo pedido #${pedidoId} pagado — $${total.toLocaleString("es-AR")}`,
    html,
  });

  console.log("📧 Email enviado al dueño OK");
}

// ======================================================
// FUNCIÓN: ENVIAR EMAIL AL CLIENTE
// ======================================================

async function emailCliente(emailDestino, nombreCliente, items, pedidoId, pedidoBD) {
  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.nombre}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${i.cantidad}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${Number(i.precio_unitario).toLocaleString("es-AR")}</td>
        </tr>`
    )
    .join("");

  const total = items.reduce(
    (acc, i) => acc + Number(i.precio_unitario) * Number(i.cantidad),
    0
  );

  const direccionEntrega = pedidoBD?.direccion || "No especificada";
  const telefonoCliente = pedidoBD?.telefono || "-";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eaeaea;">
      <div style="background:#1a1a2e;padding:24px;text-align:center;">
        <h1 style="color:#A3E635;margin:0;font-size:24px;">¡Tu compra fue confirmada!</h1>
        <p style="color:#ccc;margin:6px 0 0;font-size:14px;">Ferretería Casa Mario / Pichi</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#333;font-size:16px;">Hola <strong>${nombreCliente}</strong>, ¡muchas gracias por tu compra! 🙌</p>
        <h2 style="color:#333;font-size:18px;">Resumen del pedido #${pedidoId}</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <thead>
            <tr style="background:#f4f4f5;color:#333;">
              <th style="padding:8px 12px;text-align:left;border-radius:4px 0 0 4px;">Producto</th>
              <th style="padding:8px 12px;text-align:center;">Cantidad</th>
              <th style="padding:8px 12px;text-align:right;border-radius:0 4px 4px 0;">Precio unit.</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="text-align:right;font-size:20px;font-weight:bold;color:#1a1a2e;margin-top:16px;">
          Total: $${total.toLocaleString("es-AR")}
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <h3 style="color:#1a1a2e;margin-bottom:10px;font-size:16px;">Datos de Entrega</h3>
        <p style="margin:4px 0;color:#555;"><strong>Dirección:</strong> ${direccionEntrega}</p>
        <p style="margin:4px 0;color:#555;"><strong>Teléfono:</strong> ${telefonoCliente}</p>
        <p style="color:#666;font-size:14px;margin-top:16px;">
          Podés ver el estado y el historial de tus pedidos ingresando a tu cuenta en la sección <strong>Mis Compras</strong>.
        </p>
        <p style="color:#16a34a;font-weight:bold;margin-top:12px;">¡Muchas gracias por elegirnos!</p>
      </div>
    </div>
  `;

  if (
    !process.env.NOTIFY_EMAIL_USER ||
    !process.env.NOTIFY_EMAIL_PASS ||
    process.env.NOTIFY_EMAIL_PASS.includes("xxxx")
  ) {
    console.warn("⚠️ Nodemailer: Debes configurar tu Contraseña de Aplicación de 16 letras de Google en NOTIFY_EMAIL_PASS (.env) para enviar el correo al cliente.");
    return;
  }

  await mailTransporter.sendMail({
    from: `"Ferretería Casa Mario" <${process.env.NOTIFY_EMAIL_USER}>`,
    to: emailDestino,
    subject: `Tu pedido #${pedidoId} fue confirmado — Ferretería Casa Mario`,
    html,
  });

  console.log("📧 Email enviado al cliente OK");
}

// ======================================================
// FUNCIÓN CENTRAL: PROCESAR PAGO APROBADO (Webhook o Redirect)
// ======================================================

async function procesarPagoAprobado(db, paymentId, externalRefPedidoId) {
  try {
    const paymentClient = new Payment(mpClient);
    let pago = null;

    try {
      if (paymentId) {
        pago = await paymentClient.get({ id: paymentId });
      }
    } catch (mpErr) {
      console.warn("⚠️ No se pudo obtener detalle directo de MP:", mpErr.message);
    }

    const pedidoId = externalRefPedidoId
      ? Number(externalRefPedidoId)
      : pago?.external_reference
      ? Number(pago.external_reference)
      : null;

    if (!pedidoId) {
      console.warn("⚠️ No se encontró pedidoId asociado al pago:", paymentId);
      return false;
    }

    // Verificar si ya fue aprobado para no duplicar descuento de stock ni emails
    const checkPedido = await db.query(
      `SELECT * FROM pedidos WHERE id = $1`,
      [pedidoId]
    );

    if (checkPedido.rows.length === 0) {
      console.warn(`⚠️ Pedido #${pedidoId} no existe en la BD`);
      return false;
    }

    const pedidoActual = checkPedido.rows[0];
    if (pedidoActual.mp_status === "approved") {
      console.log(`ℹ️ El pedido #${pedidoId} ya estaba aprobado previamente.`);
      return true;
    }

    // 1. Actualizar estado del pedido en BD
    await db.query(
      `UPDATE pedidos SET mp_payment_id = $1, mp_status = 'approved' WHERE id = $2`,
      [paymentId ? String(paymentId) : pedidoActual.mp_payment_id, pedidoId]
    );
    console.log(`✅ Pedido #${pedidoId} actualizado a 'approved' en PostgreSQL`);

    // 2. Obtener items del pedido
    const itemsRes = await db.query(
      `SELECT * FROM pedido_items WHERE pedido_id = $1`,
      [pedidoId]
    );
    const itemsBD = itemsRes.rows;

    // 3. Descontar stock
    for (const item of itemsBD) {
      const productId = item.producto_id;
      const qty = Number(item.cantidad);
      if (productId && qty > 0) {
        await db.query(
          `UPDATE productos SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
          [qty, productId]
        );
      }
    }
    console.log("📦 Stock descontado correctamente");

    // 4. Enviar emails
    const emailCliente_addr = pedidoActual.usuario_email || pago?.payer?.email;
    const nombreCliente = pedidoActual.usuario_nombre || "Cliente";

    const pagoData = pago || {
      id: paymentId,
      status: "approved",
      payer: {
        first_name: nombreCliente,
        email: emailCliente_addr,
        phone: { number: pedidoActual.telefono },
      },
    };

    try {
      await emailDueno(pagoData, itemsBD, pedidoId, pedidoActual);
    } catch (mailErr) {
      console.error("⚠️ Error enviando email al dueño:", mailErr.message);
    }

    try {
      if (emailCliente_addr) {
        await emailCliente(emailCliente_addr, nombreCliente, itemsBD, pedidoId, pedidoActual);
      }
    } catch (mailErr) {
      console.error("⚠️ Error enviando email al cliente:", mailErr.message);
    }

    return true;
  } catch (error) {
    console.error("🔥 Error en procesarPagoAprobado:", error);
    return false;
  }
}

// ======================================================
// REGISTRAR ENDPOINTS DE MERCADO PAGO
// ======================================================

export default function registrarMercadoPago(app, db) {

  // ====================================================
  // POST /api/checkout — Crear preferencia de pago
  // ====================================================

  app.post("/api/checkout", async (req, res) => {
    console.log("💡 Entró al endpoint /api/checkout");

    try {
      const { items, nombre, telefono, gmail, direccion } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
      }

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: "El nombre completo es obligatorio." });
      }

      if (!telefono || !telefono.trim()) {
        return res.status(400).json({ error: "El número de teléfono es obligatorio." });
      }

      if (!gmail || !gmail.trim()) {
        return res.status(400).json({ error: "El correo electrónico es obligatorio." });
      }

      if (!direccion || !direccion.trim()) {
        return res.status(400).json({ error: "La dirección de entrega es obligatoria." });
      }

      const baseUrl = process.env.BASE_URL || "http://localhost:3334";
      const phoneNumber = Number(telefono.replace(/\D/g, "")) || 11111111;

      // --------------------------------------------------
      // Guardar pedido como PENDIENTE en la BD
      // --------------------------------------------------

      const total = items.reduce(
        (acc, p) => acc + Number(p.precio) * Number(p.cantidad),
        0
      );

      const pedidoRes = await db.query(
        `INSERT INTO pedidos (usuario_email, usuario_nombre, telefono, direccion, mp_status, total)
         VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id`,
        [gmail || null, nombre || null, telefono || null, direccion || null, total]
      );
      const pedidoId = pedidoRes.rows[0].id;

      for (const p of items) {
        await db.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, nombre, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4, $5)`,
          [pedidoId, p.id, p.nombre, Number(p.cantidad), Number(p.precio)]
        );
      }

      // --------------------------------------------------
      // Crear preferencia en MP
      // --------------------------------------------------

      const preference = new Preference(mpClient);

      const notificationUrl = `${baseUrl}/api/webhook-mp`;

      const body = {
        items: items.map((p) => ({
          id: String(p.id),
          title: p.nombre,
          quantity: Number(p.cantidad),
          unit_price: Number(p.precio),
          currency_id: "ARS",
        })),

        payer: {
          name: nombre || "",
          email: gmail || "",
          phone: {
            area_code: "11",
            number: phoneNumber,
          },
        },

        // Referencia al pedido creado, para recuperarlo en el webhook
        external_reference: String(pedidoId),

        back_urls: {
          success: `${baseUrl}/success`,
          failure: `${baseUrl}/failure`,
          pending: `${baseUrl}/pending`,
        },

        auto_return: "approved",

        notification_url: notificationUrl,

        binary_mode: true,
      };

      const response = await preference.create({ body });

      console.log(`✅ Preferencia creada. Pedido pendiente ID: ${pedidoId}`);
      console.log(`🔗 Notification URL configurada: ${notificationUrl}`);

      return res.json({
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        pedido_id: pedidoId,
      });
    } catch (error) {
      console.error("🔥 ERROR en /api/checkout:", error);
      return res.status(500).json({ error: "Error creando preferencia" });
    }
  });

  // ====================================================
  // ALL /api/webhook-mp — Webhook de Mercado Pago (POST y GET)
  // ====================================================

  app.all("/api/webhook-mp", async (req, res) => {
    // Responder 200 inmediatamente a Mercado Pago
    res.status(200).send("OK");

    console.log("📩 [WEBHOOK] Notificación recibida de Mercado Pago:", {
      query: req.query,
      body: req.body,
    });

    try {
      // Extraer datos del evento (compatible con Webhook v2, v1 e IPN)
      const type =
        req.body?.type ||
        req.query?.type ||
        req.query?.topic ||
        (req.body?.action?.startsWith("payment") ? "payment" : null);

      const paymentId =
        req.body?.data?.id ||
        req.query?.["data.id"] ||
        req.query?.id ||
        req.body?.id;

      // Si es otro tipo de evento (merchant_order, ping de prueba, etc.) ignoramos
      if (type !== "payment" || !paymentId) {
        console.log(`ℹ️ [WEBHOOK] Evento ignorado (tipo: ${type}, ID: ${paymentId})`);
        return;
      }

      console.log(`🔍 [WEBHOOK] Procesando pago ID: ${paymentId}...`);
      await procesarPagoAprobado(db, paymentId, null);
    } catch (error) {
      console.error("🔥 Error procesando webhook en segundo plano:", error);
    }
  });

  // ====================================================
  // GET /api/admin/pedidos — Listado de pedidos para el Admin
  // ====================================================

  app.get("/api/admin/pedidos", async (req, res) => {
    try {
      const { status } = req.query;
      let query = `SELECT * FROM pedidos ORDER BY fecha DESC`;
      let params = [];

      if (status && status !== "todos") {
        query = `SELECT * FROM pedidos WHERE mp_status = $1 ORDER BY fecha DESC`;
        params = [status];
      }

      const pedidosRes = await db.query(query, params);
      const pedidos = pedidosRes.rows;

      const pedidosConItems = await Promise.all(
        pedidos.map(async (pedido) => {
          const itemsRes = await db.query(
            `SELECT pi.*, p.imagenes
             FROM pedido_items pi
             LEFT JOIN (
               SELECT producto_id, STRING_AGG(imagen, ',') AS imagenes
               FROM imagenes GROUP BY producto_id
             ) p ON pi.producto_id = p.producto_id
             WHERE pi.pedido_id = $1`,
            [pedido.id]
          );
          return {
            ...pedido,
            items: itemsRes.rows,
          };
        })
      );

      return res.json(pedidosConItems);
    } catch (err) {
      console.error("Error obteniendo pedidos de admin:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // ====================================================
  // PUT /api/admin/pedidos/:id/status — Actualizar estado del pedido
  // ====================================================

  app.put("/api/admin/pedidos/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const pedidoQuery = await db.query(`SELECT * FROM pedidos WHERE id = $1`, [Number(id)]);
      if (pedidoQuery.rows.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      const pedidoActual = pedidoQuery.rows[0];

      // Si se cambia a 'approved' y antes no lo estaba, procesamos pago, emails y descuento de stock
      if (status === "approved" && pedidoActual.mp_status !== "approved") {
        await procesarPagoAprobado(db, pedidoActual.mp_payment_id, Number(id));
        return res.json({ success: true, message: "Pedido aprobado y stock descontado con éxito" });
      }

      await db.query(
        `UPDATE pedidos SET mp_status = $1 WHERE id = $2`,
        [status, Number(id)]
      );
      return res.json({ success: true, message: "Estado actualizado con éxito" });
    } catch (err) {
      console.error("Error actualizando estado del pedido:", err);
      return res.status(500).json({ error: "Error actualizando estado" });
    }
  });

  // ====================================================
  // DELETE /api/admin/pedidos/:id — Eliminar pedido
  // ====================================================

  app.delete("/api/admin/pedidos/:id", async (req, res) => {
    const { id } = req.params;

    try {
      await db.query(`DELETE FROM pedidos WHERE id = $1`, [Number(id)]);
      return res.json({ success: true, message: "Pedido eliminado" });
    } catch (err) {
      console.error("Error eliminando pedido:", err);
      return res.status(500).json({ error: "Error eliminando pedido" });
    }
  });

  // ====================================================
  // GET /api/historial/:email — Historial de compras del cliente
  // ====================================================

  app.get("/api/historial/:email", async (req, res) => {
    const { email } = req.params;

    try {
      const pedidosRes = await db.query(
        `SELECT * FROM pedidos WHERE usuario_email = $1 ORDER BY fecha DESC`,
        [email]
      );

      const pedidos = pedidosRes.rows;

      // Agregar items a cada pedido
      const pedidosConItems = await Promise.all(
        pedidos.map(async (pedido) => {
          const itemsRes = await db.query(
            `SELECT pi.*, p.imagenes
             FROM pedido_items pi
             LEFT JOIN (
               SELECT producto_id, STRING_AGG(imagen, ',') AS imagenes
               FROM imagenes GROUP BY producto_id
             ) p ON pi.producto_id = p.producto_id
             WHERE pi.pedido_id = $1`,
            [pedido.id]
          );
          return {
            ...pedido,
            items: itemsRes.rows,
          };
        })
      );

      return res.json(pedidosConItems);
    } catch (err) {
      console.error("Error obteniendo historial:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // ====================================================
  // GET /success — /failure — /pending
  // ====================================================

  app.get("/success", async (req, res) => {
    const frontUrl = process.env.FRONT_URL || "http://localhost:5173";
    console.log("🔄 [REDIRECT /success] Usuario volvió de Mercado Pago:", req.query);

    const paymentId = req.query.payment_id || req.query.collection_id;
    const pedidoId = req.query.external_reference;
    const status = req.query.status || req.query.collection_status;

    if ((status === "approved" || !status) && (paymentId || pedidoId)) {
      console.log(`⚡ Procesando aprobación desde retorno /success (Pago: ${paymentId}, Pedido: ${pedidoId})...`);
      await procesarPagoAprobado(db, paymentId, pedidoId);
    }

    res.redirect(`${frontUrl}/pago?status=success&pedido_id=${pedidoId || ""}`);
  });

  app.get("/failure", async (req, res) => {
    const frontUrl = process.env.FRONT_URL || "http://localhost:5173";
    const pedidoId = req.query.external_reference;
    if (pedidoId) {
      await db.query(`UPDATE pedidos SET mp_status = 'rejected' WHERE id = $1`, [Number(pedidoId)]);
    }
    res.redirect(`${frontUrl}/pago?status=failure`);
  });

  app.get("/pending", async (req, res) => {
    const frontUrl = process.env.FRONT_URL || "http://localhost:5173";
    res.redirect(`${frontUrl}/pago?status=pending`);
  });
}
