import React, { useState, useEffect, useRef } from "react";
import "../view/css/Navbar.css";
import { toast } from "react-hot-toast";
import API_URL from "../config/api";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  // BUSCADOR DE PRODUCTOS
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // DESPLEGABLE DE USUARIO (PERFIL / MIS COMPRAS / ADMIN)
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);


  // Actualizar cantidad de carrito
  const updateCartCount = () => {
    try {
      const storedCart = localStorage.getItem("carrito");
      if (!storedCart) {
        setCartCount(0);
        return;
      }
      const cart = JSON.parse(storedCart);
      if (Array.isArray(cart)) {
        const total = cart.reduce(
          (acc: number, item: any) => acc + (Number(item.cantidad) || 1),
          0
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // Cargar usuario desde localStorage + Backend
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return;

      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") return;

      const fixedLocalFoto = parsed.foto
        ? (parsed.foto.startsWith("http") ? parsed.foto : `${API_URL}/${parsed.foto}`)
        : `${API_URL}/uploads/default.png`;

      setUser({
        ...parsed,
        foto: fixedLocalFoto
      });

      if (parsed.email) {
        fetch(`${API_URL}/api/mostrarusuario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: parsed.email })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.user) {
              const backendFoto = data.user.foto
                ? (data.user.foto.startsWith("http") ? data.user.foto : `${API_URL}/${data.user.foto}`)
                : `${API_URL}/uploads/default.png`;

              const fixedUser = {
                nombre: data.user.nombre,
                email: data.user.email,
                foto: backendFoto
              };

              setUser(fixedUser);
              localStorage.setItem("user", JSON.stringify(fixedUser));
            }
          })
          .catch((err) => console.error("Error obteniendo usuario:", err));
      }
    } catch (e) {
      console.error("Error leyendo usuario de localStorage:", e);
    }
  }, []);

  // Cargar productos para búsqueda en vivo
  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch((err) => console.error("Error cargando productos para buscador:", err));
  }, []);

  // Filtrar productos al escribir
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = allProducts.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
    );
    setSearchResults(filtered.slice(0, 7));
    setShowSearchDropdown(true);
  }, [searchTerm, allProducts]);

  // Clic afuera para cerrar los desplegables
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToCart = (e: React.MouseEvent, producto: any) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const precioFinal =
        Number(producto.precioenoferta) > 0
          ? Number(producto.precioenoferta)
          : Number(producto.precio);
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const index = carrito.findIndex((item: any) => item.id === producto.id);
      if (index !== -1) {
        carrito[index].cantidad += 1;
      } else {
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: precioFinal,
          cantidad: 1,
          imagen: producto.imagenes?.[0] ?? "default.png",
        });
      }
      localStorage.setItem("carrito", JSON.stringify(carrito));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Producto agregado al carrito");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowUserDropdown(false);
    window.location.href = "/";
  };

  return (
    <nav className="navbar-container fixed-navbar">
      <div className="navbar">

        {/* LOGO E IDENTIDAD DE LA FERRETERÍA */}
        <div className="navbar-logo-container">
          <div className="navbar-logo">
            <img
              src={`${API_URL}/uploads/logo.png`}
              className="logo-redondo"
              alt="Casa Mario"
            />
            <div className="navbar-title-container">
              <h1 className="navbar-title">Ferretería Casa Mario</h1>
              <i className="navbar-subtitle">De Christian Landi</i>
            </div>
          </div>
        </div>

        {/* BUSCADOR PROMINENTE EN EL CENTRO */}
        <div className="navbar-search-wrapper" ref={searchRef}>
          <div className="navbar-search-box">
            <i className="fa-solid fa-magnifying-glass search-input-icon"></i>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim()) setShowSearchDropdown(true);
              }}
            />
            {searchTerm && (
              <button
                className="navbar-search-clear"
                onClick={() => {
                  setSearchTerm("");
                  setShowSearchDropdown(false);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* DESPLEGABLE DE RESULTADOS DE BÚSQUEDA */}
          {showSearchDropdown && (
            <div className="navbar-search-dropdown">
              {searchResults.length > 0 ? (
                searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    className="navbar-search-item"
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchTerm("");
                      window.location.href = `/detalleproducto/${prod.id}`;
                    }}
                  >
                    <img
                      src={
                        prod.imagenes?.[0]
                          ? `${API_URL}/uploads/${prod.imagenes[0]}`
                          : `${API_URL}/uploads/default.png`
                      }
                      alt={prod.nombre}
                      className="search-item-img"
                    />
                    <div className="search-item-info">
                      <span className="search-item-name">{prod.nombre}</span>
                      <span className="search-item-price">
                        ${Number(prod.precioenoferta || prod.precio).toFixed(2)}
                      </span>
                    </div>
                    <button
                      className="search-item-add-btn"
                      onClick={(e) => handleAddToCart(e, prod)}
                      title="Agregar al carrito"
                    >
                      <i className="fa-solid fa-cart-plus"></i>
                    </button>
                  </div>
                ))
              ) : (
                <div className="navbar-search-empty">
                  No se encontraron productos para "<strong>{searchTerm}</strong>"
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTÓN MOBILE */}
        <button
          className="menu-toggle"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* NAVEGACIÓN Y MENÚ DESPLEGABLE DE PERFIL DE USUARIO */}
        <div className={`navbar-right-section ${isOpen ? "open" : ""}`}>
          <ul className="navbar-links">
            <li>
              <a href="/" onClick={() => setIsOpen(false)}>
                Inicio
              </a>
            </li>
            <li>
              <a href="/sobrenosotros" onClick={() => setIsOpen(false)}>
                Contacto
              </a>
            </li>
          </ul>

          {/* MENÚ DESPLEGABLE DE PERFIL (FOTO, NOMBRE, MIS COMPRAS Y ADMIN JUNTOS) */}
          {user ? (
            <div className="navbar-user-dropdown-container" ref={userDropdownRef}>
              <button
                className="navbar-user-trigger"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                aria-label="Menú de usuario"
              >
                <img
                  src={user.foto}
                  alt={user.nombre}
                  className="navbar-user-pic"
                />
                <span className="navbar-username">{user.nombre}</span>
                <span className={`dropdown-arrow ${showUserDropdown ? "active" : ""}`}>
                  ▼
                </span>
              </button>

              {showUserDropdown && (
                <div className="navbar-user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <strong>{user.nombre}</strong>
                    <small>{user.email}</small>
                  </div>

                  <div className="dropdown-divider"></div>

                  <a
                    href="/miscompras"
                    className="dropdown-item"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <i className="fa-solid fa-box-archive dropdown-icon"></i> Mis Compras
                  </a>

                  {user.email === "leomartin9808@gmail.com" && (
                    <a
                      href="/adminvista"
                      className="dropdown-item admin-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <i className="fa-solid fa-sliders dropdown-icon"></i> Panel Admin
                    </a>
                  )}

                  <div className="dropdown-divider"></div>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    <i className="fa-solid fa-right-from-bracket dropdown-icon"></i> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className="navbar-login-btn">
              Iniciar Sesión
            </a>
          )}

          {/* ÍCONO DE CARRITO */}
          <a href="/carrito" className="navbar-cart-link" title="Carrito">
            <i className="fa-solid fa-cart-shopping cart-icon"></i>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
