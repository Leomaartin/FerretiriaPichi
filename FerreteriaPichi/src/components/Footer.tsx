import React from "react";
import "./Footer.css";
import API_URL from "../config/api";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-top-accent"></div>

      <div className="footer-container">
        <div className="footer-grid">

          {/* COLUMNA 1: IDENTIDAD DE LA FERRETERÍA */}
          <div className="footer-col brand-col">
            <div className="footer-logo-box">
              <img
                src="/logo.png"
                alt="Ferretería Casa Mario"
                className="footer-logo-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `${API_URL}/uploads/logo.png`;
                }}
              />
              <div>
                <h3 className="footer-brand-title">Ferretería Casa Mario</h3>
                <span className="footer-brand-subtitle">De Christian Landi</span>
              </div>
            </div>
            <p className="footer-about-text">
              Más de cuatro décadas acompañando a profesionales, gremios y hogares con herramientas
              de primera línea, materiales de calidad y la mejor atención personalizada de Zárate.
            </p>
            <div className="footer-social-links">
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn whatsapp"
                title="Contactar por WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a
                href="/sobrenosotros#contactanos"
                className="social-btn email"
                title="Envíanos un mensaje"
              >
                <i className="fa-solid fa-envelope"></i>
              </a>
              <a
                href="https://maps.google.com/?q=Av.+Gallesio+590,+Zárate"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn location"
                title="Ver ubicación en Google Maps"
              >
                <i className="fa-solid fa-location-dot"></i>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN RÁPIDA */}
          <div className="footer-col links-col">
            <h4 className="footer-col-title">Navegación</h4>
            <ul className="footer-links-list">
              <li>
                <a href="/">
                  <i className="fa-solid fa-angle-right"></i> Inicio
                </a>
              </li>
              <li>
                <a href="/sobrenosotros">
                  <i className="fa-solid fa-angle-right"></i> Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="/sobrenosotros#contactanos">
                  <i className="fa-solid fa-angle-right"></i> Contacto
                </a>
              </li>
              <li>
                <a href="/carrito">
                  <i className="fa-solid fa-angle-right"></i> Mi Carrito
                </a>
              </li>
              <li>
                <a href="/miscompras">
                  <i className="fa-solid fa-angle-right"></i> Mis Compras
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: ATENCIÓN Y CONTACTO */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">Atención al Cliente</h4>
            <ul className="footer-contact-info">
              <li>
                <i className="fa-solid fa-location-dot contact-icon"></i>
                <span>Av. Gallesio 590, Zárate, Buenos Aires</span>
              </li>
              <li>
                <i className="fa-solid fa-clock contact-icon"></i>
                <span>Lunes a Sábado: 8:00 a 12:30 | 15:30 a 19:30</span>
              </li>
              <li>
                <i className="fa-solid fa-truck-fast contact-icon"></i>
                <span>Envíos locales y retiros en mostrador</span>
              </li>
              <li>
                <i className="fa-solid fa-credit-card contact-icon"></i>
                <span>Mercado Pago, tarjetas y efectivo</span>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: TARJETA DE CRÉDITOS DEL DESARROLLADOR */}
          <div className="footer-col dev-col">
            <h4 className="footer-col-title">Desarrollo y Tecnología</h4>
            <div className="dev-card">
              <div className="dev-avatar-wrapper">
                <img
                  src="/leonel.jpeg"
                  alt="Leonel Martin - Técnico en Programación"
                  className="dev-photo"
                  onError={(e) => {
                    // Si todavía no subió leonel.jpeg, intenta desde backend o muestra fallback
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.triedBackend) {
                      target.dataset.triedBackend = "true";
                      target.src = `${API_URL}/uploads/leonel.jpeg`;
                    } else {
                      target.onerror = null;
                      target.src =
                        "https://ui-avatars.com/api/?name=Leonel+Martin&background=a3e635&color=0f172a&bold=true&size=128";
                    }
                  }}
                />
                <span className="dev-online-badge" title="Desarrollador activo"></span>
              </div>
              <div className="dev-details">
                <span className="dev-tag">DESARROLLADO POR</span>
                <strong className="dev-name">Leonel Martin</strong>
                <span className="dev-profession">Técnico en Programación</span>
                <p className="dev-summary">
                  Desarrollo de sistemas web a medida, e-commerce y soluciones digitales.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BARRA INFERIOR DE DERECHOS */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © {currentYear} <strong>Ferretería Casa Mario</strong>. Todos los derechos reservados.
          </p>
          <p className="dev-credit-line">
            Programado con <i className="fa-solid fa-heart heart-icon"></i> por{" "}
            <strong>Leonel Martin</strong> · <em>Técnico en Programación</em>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
