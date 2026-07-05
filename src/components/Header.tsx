import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const isProductsPage = location.pathname === "/products";
  const isLoginPage = location.pathname === "/login";

  const currentPath = `${location.pathname}${location.search}`;

  const loginPath = `/login?redirect=${encodeURIComponent(
    currentPath,
  )}`;

  useEffect(() => {
    if (location.pathname === "/products") {
      sessionStorage.removeItem("logout-redirect");
    }
  }, [location.pathname]);

  function saveScrollPosition() {
    if (location.pathname === "/products") {
      sessionStorage.setItem(
        "products-scroll-y",
        String(window.scrollY),
      );
    }
  }

  function handleLogout() {
    sessionStorage.setItem("logout-redirect", "true");

    logout();

    navigate("/products", {
      replace: true,
    });
  }

  return (
    <header className="bg-slate-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="text-slate-950 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {isProductsPage ? (
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Proizvodi
            </h1>
          ) : (
            <span className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Proizvodi
            </span>
          )}
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              Bok, {user.firstName}
            </span>

            <Link
              to="/favorites"
              className="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              ♡ Favoriti
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              Odjava
            </button>
          </div>
        ) : !isLoginPage ? (
          <Link
            to={loginPath}
            onClick={saveScrollPosition}
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            Prijava
          </Link>
        ) : null}
      </div>
    </header>
  );
}