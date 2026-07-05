import { Link } from "react-router";
import { FavoriteButton } from "../components/FavoriteButton";
import { useFavorites } from "../context/FavoritesContext";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Moj račun
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Favoriti
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Proizvodi koje si spremila za kasnije.
            </p>
          </div>

          <Link
            to="/products"
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
          >
            ← Natrag na proizvode
          </Link>
        </header>

        {favorites.length === 0 ? (
          <div className="border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Još nemaš favorita
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Klikni srce na proizvodu koji želiš spremiti.
            </p>

            <Link
              to="/products"
              className="mt-5 inline-block bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Pregledaj proizvode
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((product) => (
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-sm border border-slate-200 bg-white text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
              >
                <FavoriteButton product={product} />

                <Link
                  to={`/products/${product.id}?from=favorites`}
                  className="block focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <div className="border-b border-slate-100 bg-white">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="h-52 w-full object-contain"
                    />
                  </div>

                  <div className="space-y-3 p-5">
                    <h2 className="font-bold text-slate-950">
                      {product.title}
                    </h2>

                    <p className="font-bold text-slate-900">
                      {formatPrice(product.price)}
                    </p>

                    <p className="text-sm font-semibold text-blue-600">
                      Pogledaj detalje →
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}