import toast from "react-hot-toast";
import { ToastCard } from "../components/Toast/ToastCard";
import type { ToastActionType } from "../components/Toast/ToastCard";

interface CustomNotifyOptions {
  type: ToastActionType;
  badgeText: string;
  actionText: string;
  title: string;
  message: string;
  duration?: number;
}

const showCustomToast = ({
  type,
  badgeText,
  actionText,
  title,
  message,
  duration = 3800,
}: CustomNotifyOptions) => {
  return toast.custom(
    (t) => (
      <ToastCard
        t={t}
        type={type}
        badgeText={badgeText}
        actionText={actionText}
        title={title}
        message={message}
        duration={duration}
      />
    ),
    { duration }
  );
};

export const notify = {
  // --- PRODUCTOS ---
  productCreated: (name: string) => {
    return showCustomToast({
      type: "create",
      badgeText: "PRODUCTO",
      actionText: "CREADO",
      title: name || "Nuevo Producto",
      message: "El producto fue agregado al catálogo con éxito.",
    });
  },

  productUpdated: (name: string) => {
    return showCustomToast({
      type: "edit",
      badgeText: "PRODUCTO",
      actionText: "ACTUALIZADO",
      title: name || "Producto",
      message: "Se guardaron las modificaciones correctamente.",
    });
  },

  productDeleted: (name: string) => {
    return showCustomToast({
      type: "delete",
      badgeText: "PRODUCTO",
      actionText: "ELIMINADO",
      title: name || "Producto",
      message: "El producto fue eliminado del inventario.",
    });
  },

  // --- CATEGORÍAS ---
  categoryCreated: (name: string) => {
    return showCustomToast({
      type: "create",
      badgeText: "CATEGORÍA",
      actionText: "CREADA",
      title: name || "Nueva Categoría",
      message: "La categoría fue registrada exitosamente.",
    });
  },

  categoryUpdated: (name: string) => {
    return showCustomToast({
      type: "edit",
      badgeText: "CATEGORÍA",
      actionText: "ACTUALIZADA",
      title: name || "Categoría",
      message: "Se actualizaron los datos de la categoría.",
    });
  },

  categoryDeleted: (name: string) => {
    return showCustomToast({
      type: "delete",
      badgeText: "CATEGORÍA",
      actionText: "ELIMINADA",
      title: name || "Categoría",
      message: "La categoría fue eliminada permanentemente.",
    });
  },

  // --- IMÁGENES ---
  imageUploaded: (count: number = 1) => {
    return showCustomToast({
      type: "create",
      badgeText: "IMÁGENES",
      actionText: "SUBIDAS",
      title: `${count} ${count === 1 ? "imagen subida" : "imágenes subidas"}`,
      message: "Las fotos se asociaron al producto correctamente.",
    });
  },

  imageDeleted: () => {
    return showCustomToast({
      type: "delete",
      badgeText: "IMAGEN",
      actionText: "ELIMINADA",
      title: "Foto eliminada",
      message: "La imagen fue removida de la galería del producto.",
    });
  },

  // --- ESTADO / VISIBILIDAD ---
  statusChanged: (title: string, message: string) => {
    return showCustomToast({
      type: "info",
      badgeText: "ESTADO",
      actionText: "ACTUALIZADO",
      title,
      message,
      duration: 3000,
    });
  },

  // --- ERROR Y GENÉRICO ---
  error: (title: string, message: string = "Ocurrió un problema al procesar la solicitud.") => {
    return showCustomToast({
      type: "error",
      badgeText: "ALERTA",
      actionText: "ERROR",
      title,
      message,
      duration: 4500,
    });
  },

  success: (title: string, message: string = "Operación realizada correctamente.") => {
    return showCustomToast({
      type: "create",
      badgeText: "SISTEMA",
      actionText: "ÉXITO",
      title,
      message,
      duration: 3500,
    });
  },
};

export default notify;
