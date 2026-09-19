// 🛡️ Parche defensivo para evitar crashes de React causados por traductores de navegador (Google Translate) o extensiones
if (typeof window !== "undefined") {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (console) {
        console.warn("removeChild seguro: el nodo a eliminar ya no es hijo directo.", this, child);
      }
      return (child.parentNode?.removeChild(child) as T) || child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.warn("insertBefore seguro: el nodo de referencia no es hijo directo.", this, referenceNode);
      }
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}

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
import MisCompras from "./view/MisCompras.tsx";
import PagoResultado from "./view/PagoResultado.tsx";
import AdminRoute from "./components/AdminRoute.tsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ⬇️ AGREGAMOS
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConfirmProvider } from "./components/ConfirmModal/ConfirmContext";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

const GOOGLE_CLIENT_ID =
  "466240667276-6tsh08tln35u4i5c80fted614ad0sdb2.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ConfirmProvider>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        containerStyle={{
          zIndex: 99999,
          bottom: 24,
          right: 24,
        }}
        toastOptions={{
          duration: 3800,
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/detalleproducto/:id" element={<DetalleProducto />} />
          <Route path="/categorias/:id" element={<VistaCategoria />} />
          <Route path="/adminproductos" element={<AdminRoute><AdminProductos /></AdminRoute>} />
          <Route path="/admincategorias" element={<AdminRoute><AdminCategorias /></AdminRoute>} />
          <Route path="/adminvista" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route
            path="/editar-imagenes/:id"
            element={<AdminRoute><EditarImagenesProducto /></AdminRoute>}
          />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/miscompras" element={<MisCompras />} />
          <Route path="/pago" element={<PagoResultado />} />

          <Route path="/login" element={<Login />} />
          <Route path="/sobrenosotros" element={<SobreNosotros />} />
        </Routes>
      </Router>
    </ConfirmProvider>
  </GoogleOAuthProvider>
</ErrorBoundary>
);
