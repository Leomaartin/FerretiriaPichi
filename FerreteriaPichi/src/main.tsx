import ReactDOM from "react-dom/client";
import Home from "./view/Home.tsx";
import DetalleProducto from "./view/DetalleProducto.tsx";
import VistaCategoria from "./view/VistaCategoria.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import AdminProductos from "./view/EditarProducto.tsx";
import AdminCategorias from "./view/EditarCategorias.tsx";
import EditarImagenesProducto from "./view/EditarImagenProducto.tsx";
import Carrito from "./view/Carrito.tsx";
import Login from "./view/Login/Login.tsx";
import Admin from "./view/AdministradorPichci.tsx";
import SobreNosotros from "./view/SobreNosotros.tsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ⬇️ AGREGAMOS
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "466240667276-6tsh08tln35u4i5c80fted614ad0sdb2.apps.googleusercontent.com";
// ejemplo:
// const GOOGLE_CLIENT_ID = "1092381290381-kajshdkajshdk.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/detalleproducto/:id" element={<DetalleProducto />} />
        <Route path="/categorias/:id" element={<VistaCategoria />} />
        <Route path="/adminproductos" element={<AdminProductos />} />
        <Route path="/admincategorias" element={<AdminCategorias />} />
        <Route path="/adminvista" element={<Admin />} />
        <Route
          path="/editar-imagenes/:id"
          element={<EditarImagenesProducto />}
        />
        <Route path="/carrito" element={<Carrito />} />

        <Route path="/login" element={<Login />} />
        <Route path="/sobrenosotros" element={<SobreNosotros />} />
      </Routes>
    </Router>
  </GoogleOAuthProvider>
);
