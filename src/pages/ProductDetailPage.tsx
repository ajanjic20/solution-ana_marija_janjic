import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router";
import { getProductById } from "../api/productsApi";
import type { Product } from "../types/product";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function ProductDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backTo = searchParams.toString()
    ? `/products?${searchParams.toString()}`
    : "/products";

  useEffect(() => {
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId < 1) {
      setError("ID proizvoda nije ispravan.");
      setIsLoading(false);
      return;
    }

    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
    setProduct(null);

    getProductById(productId)
      .then((data) => {
        if (isCurrentRequest) {
          setProduct(data);
          setSelectedImageIndex(0);
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setError(
            "Došlo je do pogreške pri učitavanju detalja proizvoda.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-slate-600">
          Učitavanje detalja proizvoda...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center font-bold text-red-600">
          {error ?? "Proizvod nije pronađen."}
        </p>

        <div className="mt-6 text-center">
          <Link
            to={backTo}
            className="inline-block border border-slate-400 px-4 py-2 font-bold hover:bg-slate-100"
          >
            ← Natrag na proizvode
          </Link>
        </div>
      </main>
    );
  }

  const images =
    product.images.length > 0 ? product.images : [product.thumbnail];

  const selectedImage =
    images[selectedImageIndex] ?? product.thumbnail;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to={backTo}
        className="mb-8 inline-block border border-slate-400 px-4 py-2 font-bold hover:bg-slate-100"
      >
        ← Natrag na proizvode
      </Link>

      <article className="grid gap-10 lg:grid-cols-2">
        <section>
          <img
            src={selectedImage}
            alt={product.title}
            className="h-96 w-full object-contain"
          />

          {images.length > 1 && (
            <div className="mt-5 flex gap-3 overflow-x-auto">
              {images.map((image, index) => {
                const isSelected = index === selectedImageIndex;

                return (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={
                      isSelected
                        ? "border-2 border-blue-600"
                        : "border border-slate-300 hover:border-slate-500"
                    }
                    aria-label={`Prikaži sliku ${index + 1} proizvoda ${product.title}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-20 w-20 object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="text-center lg:text-left">
          <p className="mb-3 font-bold capitalize text-blue-600">
            {product.category}
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            {product.title}
          </h1>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 leading-7 text-slate-600">
            {product.description}
          </p>

          <dl className="mt-8 space-y-4 border-t border-slate-300 pt-6">
            <div className="flex justify-between gap-6 border-b border-slate-200 pb-4">
              <dt className="font-bold text-slate-900">Ocjena</dt>
              <dd className="text-slate-600">
                ★ {product.rating.toFixed(1)} / 5
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-200 pb-4">
              <dt className="font-bold text-slate-900">Kategorija</dt>
              <dd className="capitalize text-slate-600">
                {product.category}
              </dd>
            </div>

            <div className="flex justify-between gap-6 border-b border-slate-200 pb-4">
              <dt className="font-bold text-slate-900">Zaliha</dt>
              <dd className="text-slate-600">
                {product.stock > 0
                  ? `${product.stock} komada dostupno`
                  : "Trenutačno nije dostupno"}
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </main>
  );
}