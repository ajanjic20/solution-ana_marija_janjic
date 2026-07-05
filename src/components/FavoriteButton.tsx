import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import type { Product } from "../types/product";

interface FavoriteButtonProps {
  product: Product;
  placement?: "card" | "detail";
}

export function FavoriteButton({
  product,
  placement = "card",
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();

  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const promptId = useId();

  const productIsFavorite = isFavorite(product.id);

  useEffect(() => {
    if (!isPromptOpen) {
      return;
    }

    loginButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setIsPromptOpen(false);

      window.requestAnimationFrame(() => {
        favoriteButtonRef.current?.focus();
      });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPromptOpen]);

  function closePrompt() {
    setIsPromptOpen(false);

    window.requestAnimationFrame(() => {
      favoriteButtonRef.current?.focus();
    });
  }

  function goToLogin() {
    const redirectTo = `${location.pathname}${location.search}`;

    sessionStorage.setItem(
      "pending-favorite-product",
      JSON.stringify(product),
    );

    sessionStorage.setItem(
      "products-scroll-y",
      String(window.scrollY),
    );

    navigate(
      `/login?redirect=${encodeURIComponent(redirectTo)}`,
    );
  }

  const wrapperClassName =
    placement === "card"
      ? "absolute right-3 top-3 z-20"
      : "relative z-20 inline-block";

  const favoriteButtonClassName = productIsFavorite
    ? "flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-xl text-red-600 shadow-sm transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
    : "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2";

  return (
    <div className={wrapperClassName}>
      <button
        ref={favoriteButtonRef}
        type="button"
        aria-label={
          productIsFavorite
            ? `Ukloni ${product.title} iz favorita`
            : `Dodaj ${product.title} u favorite`
        }
        aria-pressed={productIsFavorite}
        aria-expanded={
          isAuthenticated ? undefined : isPromptOpen
        }
        aria-controls={
          isAuthenticated ? undefined : promptId
        }
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (!isAuthenticated) {
            setIsPromptOpen(true);
            return;
          }

          toggleFavorite(product);
        }}
        className={favoriteButtonClassName}
      >
        <span aria-hidden="true">
          {productIsFavorite ? "♥" : "♡"}
        </span>
      </button>

      {isPromptOpen && (
        <div
          id={promptId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${promptId}-title`}
          aria-describedby={`${promptId}-description`}
          className="absolute right-0 top-12 w-60 border border-slate-200 bg-white p-4 text-left shadow-lg"
        >
          <button
            type="button"
            onClick={closePrompt}
            className="absolute right-2 top-1 text-lg text-slate-500 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label="Zatvori poruku"
          >
            ×
          </button>

          <p
            id={`${promptId}-title`}
            className="pr-4 text-sm font-semibold text-slate-900"
          >
            Prijavite se za favorite
          </p>

          <p
            id={`${promptId}-description`}
            className="mt-1 text-sm leading-5 text-slate-600"
          >
            Spremi proizvode koje želiš pogledati kasnije.
          </p>

          <button
            ref={loginButtonRef}
            type="button"
            onClick={goToLogin}
            className="mt-4 w-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
          >
            Prijava
          </button>
        </div>
      )}
    </div>
  );
}