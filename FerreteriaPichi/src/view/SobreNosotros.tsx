import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "./css/Sobrenosotros.css";
import ReviewsComponent from "./Reseñas"



export default function SobreNosotros() {
  // --- CONFIGURACIÓN DE CONTACTO ---
  const whatsappNumber = "5491100000000"; // Reemplaza con el número real (ej: 5491112345678)
  const contactEmail = "ferreteria.mario@gmail.com"; // Reemplaza con tu email




  return (
    <main className="page-container">
   
        <Navbar />
  
      {/* Hero Section / Título Principal (MANTENIDO) */}
      <section className="hero-section">
        <h1 className="hero-title"> Sobre Ferretería Casa Mario</h1>

        <p className="hero-subtitle">
          Tu socio de confianza en herramientas, materiales y soluciones para
          cada proyecto.
        </p>
      </section>
      <section className="mission-section">
        <p className="mission-text">
          En <strong>Ferretería Casa Mario</strong> somos un equipo apasionado
          por ayudar a que tus proyectos salgan perfectos. Desde herramientas
          básicas hasta equipos profesionales, trabajamos todos los días para
          ofrecer productos de la mejor calidad, atención personalizada y
          precios accesibles para todos.
        </p>
      </section>
      {/* Galería de Imágenes (MANTENIDO) */}
      <section className="gallery-section">
        <img
          src="./backend/uploads/img/foto1.avif"
          alt="Ferretería"
          className="gallery-image"
        />

        <img
          src="./backend/uploads/img/foto2.jpg"
          alt="Herramientas"
          className="gallery-image"
        />

        <img
          src="./backend/uploads/img/foto3.webp"
          alt="Equipo de trabajo"
          className="gallery-image"
        />
      </section>
      {/* Quiénes Somos (MANTENIDO) */}
      <section className="about-us-section">
        <h2 className="about-us-title"> Nuestra Historia y Valores</h2>
        <div className="about-us-content">
          <p className="about-us-text">
            Somos una ferretería familiar que esta desde <strong>1979</strong>{" "}
            acompañando a carpinteros, electricistas, albañiles, mecánicos y
            vecinos que confían en nosotros día a día. Creemos en el trabajo
            bien hecho, en la confianza y en brindar **soluciones reales** para
            cada necesidad.
            <span className="priority-text">
              ¡Tu proyecto es nuestra prioridad!
            </span>
          </p>
        </div>
      </section>
      
      {/* 📞 NUEVA SECCIÓN: CONTÁCTANOS */}
      <section className="contact-section" id="contactanos">
        <h2 className="contact-title">Contáctanos</h2>
        <p className="contact-subtitle">
          ¡Estamos listos para ayudarte con tu próximo proyecto!{" "}
        </p>

        <div className="contact-buttons-container">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button whatsapp-button"
          >
            💬 Escribinos por WhatsApp
          </a>

          <a
            href={`mailto:${contactEmail}`}
            className="contact-button email-button"
          >
            📧 Envianos un Email
          </a>
        </div>
      </section>
      
      {/* Ubicación con Mapa (MANTENIDO) */}
      <section className="location-section">
        <h2 className="location-title">Visítanos</h2>
        <div className="map-container">
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3303.6120752450415!2d-59.03339578793912!3d-34.10507693122478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bb0b414bc831c5%3A0x8940b32ba529186a!2sCasa%20Mario!5e0!3m2!1ses!2sar!4v1764144318473!5m2!1ses!2sar"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <p className="location-info">
          Te esperamos en Av. Gallesio 590, Zárate.
        </p>
      </section>

 {/* Sección de Reseñas */}
<section className="reviews-section">
  <h2 className="reviews-title">Reseñas de Nuestros Clientes</h2>

  <ReviewsComponent />
</section>
   
  
    </main>
  );
}
