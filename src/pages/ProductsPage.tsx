import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  getAllProducts,
  getCategories,
  searchProducts,
} from "../api/productsApi";
import { FavoriteButton } from "../components/FavoriteButton";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Category, Product } from "../types/product";

const PRODUCTS_PER_PAGE = 20;

function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function getNumberParam(value: string | null): number | null {
  if (value === null || value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "left-ellipsis" | "right-ellipsis"> {
  if (totalPages <= 0) {
    return [];
  }

  const siblings = 1;

  let windowStart = currentPage - siblings;
  let windowEnd = currentPage + siblings;

  if (windowStart < 1) {
    windowEnd += 1 - windowStart;
    windowStart = 1;
  }

  if (windowEnd > totalPages) {
    windowStart -= windowEnd - totalPages;
    windowEnd = totalPages;
  }

  windowStart = Math.max(1, windowStart);

  const pagesToShow = new Set<number>([1, totalPages]);

  for (let page = windowStart; page <= windowEnd; page += 1) {
    pagesToShow.add(page);
  }

  const pages = [...pagesToShow].sort(
    (firstPage, secondPage) => firstPage - secondPage,
  );

  const items: Array<number | "left-ellipsis" | "right-ellipsis"> = [];

  pages.forEach((page, index) => {
    const previousPage = pages[index - 1];

    if (previousPage !== undefined && page - previousPage > 1) {
      items.push(
        page < currentPage ? "left-ellipsis" : "right-ellipsis",
      );
    }

    items.push(page);
  });

  return items;
}

export function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const minPrice = getNumberParam(searchParams.get("minPrice"));
  const maxPrice = getNumberParam(searchParams.get("maxPrice"));

  const [searchInput, setSearchInput] = useState(searchQuery);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const pageFromUrl = Number(searchParams.get("page"));

  const currentPage =
    Number.isInteger(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const normalizedSearch = debouncedSearch.trim();

    if (normalizedSearch === searchQuery) {
      return;
    }

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (normalizedSearch) {
        nextParams.set("q", normalizedSearch);
      } else {
        nextParams.delete("q");
      }

      nextParams.set("page", "1");

      return nextParams;
    });
  }, [debouncedSearch, searchQuery, setSearchParams]);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsCategoriesLoading(true);
    setCategoriesError(null);

    getCategories()
      .then((data) => {
        if (isCurrentRequest) {
          setCategories(data);
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setCategoriesError(
            "Kategorije se trenutačno ne mogu dohvatiti.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsCategoriesLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);

    const request = searchQuery
      ? searchProducts(searchQuery)
      : getAllProducts();

    request
      .then((data) => {
        if (isCurrentRequest) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setError(
            "Došlo je do pogreške pri učitavanju proizvoda. Pokušajte ponovno.",
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
  }, [searchQuery, reloadKey]);

  const normalizedSearchQuery = searchQuery.toLocaleLowerCase();

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      !normalizedSearchQuery ||
      product.title.toLocaleLowerCase().includes(normalizedSearchQuery);

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    const matchesMinPrice =
      minPrice === null || product.price >= minPrice;

    const matchesMaxPrice =
      maxPrice === null || product.price <= maxPrice;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE,
  );

  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const skip = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

  const products = filteredProducts.slice(
    skip,
    skip + PRODUCTS_PER_PAGE,
  );

  const paginationItems = getPaginationItems(
    safeCurrentPage,
    totalPages,
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const savedScrollPosition = sessionStorage.getItem(
      "products-scroll-y",
    );

    if (!savedScrollPosition) {
      return;
    }

    const scrollPosition = Number(savedScrollPosition);

    if (!Number.isFinite(scrollPosition)) {
      sessionStorage.removeItem("products-scroll-y");
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "auto",
      });

      sessionStorage.removeItem("products-scroll-y");
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [isLoading, filteredProducts.length]);

  useEffect(() => {
    if (
      !isLoading &&
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        nextParams.set("page", String(totalPages));

        return nextParams;
      });
    }
  }, [
    currentPage,
    isLoading,
    setSearchParams,
    totalPages,
  ]);

  function updateFilterParam(name: string, value: string) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (value.trim()) {
        nextParams.set(name, value);
      } else {
        nextParams.delete(name);
      }

      nextParams.set("page", "1");

      return nextParams;
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePageChange(page: number) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      nextParams.set("page", String(page));

      return nextParams;
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function clearFilters() {
    setSearchInput("");

    setSearchParams({
      page: "1",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function saveScrollPosition() {
    sessionStorage.setItem(
      "products-scroll-y",
      String(window.scrollY),
    );
  }

  function getProductDetailsPath(productId: number): string {
    const detailParams = new URLSearchParams(searchParams);

    detailParams.set("page", String(safeCurrentPage));

    return `/products/${productId}?${detailParams.toString()}`;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-3 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-slate-200 pb-7">
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Pronađi proizvode po nazivu, kategoriji ili cijeni.
          </p>

          <div className="mt-6 max-w-xl">
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Pretraži proizvode
            </label>

            <input
              id="product-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Npr. phone, shoes, laptop..."
              className="w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </header>

        <section
          className="mb-8 border border-slate-200 bg-white p-4 shadow-sm"
          aria-label="Filteri proizvoda"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="w-full lg:max-w-xs">
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Kategorija
              </label>

              <select
                id="category"
                value={selectedCategory}
                disabled={isCategoriesLoading}
                onChange={(event) =>
                  updateFilterParam("category", event.target.value)
                }
                className="w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sve kategorije</option>

                {categories.map((category: Category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              {categoriesError && (
                <p className="mt-2 text-sm text-red-600">
                  {categoriesError}
                </p>
              )}
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-xl">
              <div>
                <label
                  htmlFor="min-price"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Najniža cijena
                </label>

                <input
                  id="min-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={searchParams.get("minPrice") ?? ""}
                  onChange={(event) =>
                    updateFilterParam("minPrice", event.target.value)
                  }
                  placeholder="npr. 10"
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="max-price"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Najviša cijena
                </label>

                <input
                  id="max-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={searchParams.get("maxPrice") ?? ""}
                  onChange={(event) =>
                    updateFilterParam("maxPrice", event.target.value)
                  }
                  placeholder="npr. 100"
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              Očisti filtre
            </button>
          </div>
        </section>

        {isLoading ? (
          <p className="mb-8 text-center text-slate-600">
            Učitavanje proizvoda...
          </p>
        ) : error ? (
          <div className="mb-8 border border-red-200 bg-red-50 p-5 text-center">
            <p className="font-semibold text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-4 border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Pokušaj ponovno
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mb-8 border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Nema pronađenih proizvoda
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Promijeni pretragu ili prilagodi filtre.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Očisti filtre
            </button>
          </div>
        ) : (
          <p className="mb-6 text-sm text-slate-600">
            Prikazano <strong>{products.length}</strong> od{" "}
            <strong>{filteredProducts.length}</strong> proizvoda
          </p>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-sm border border-slate-200 bg-white text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
              >
                <FavoriteButton product={product} />

                <Link
                  to={getProductDetailsPath(product.id)}
                  onClick={saveScrollPosition}
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
                      {product.price} €
                    </p>

                    <p className="text-sm leading-6 text-slate-600">
                      {truncateText(product.description)}
                    </p>

                    <p className="pt-1 text-sm font-semibold text-blue-600">
                      Pogledaj detalje →
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !error && totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label="Paginacija proizvoda"
          >
            {paginationItems.map((item) => {
              if (typeof item === "string") {
                return (
                  <span key={item} className="px-1 text-slate-500">
                    …
                  </span>
                );
              }

              const isCurrentPage = item === safeCurrentPage;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageChange(item)}
                  aria-current={isCurrentPage ? "page" : undefined}
                  className={
                    isCurrentPage
                      ? "border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                      : "border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
                  }
                >
                  {item}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </main>
  );
}