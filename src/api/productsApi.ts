import type {
  Category,
  Product,
  ProductsResponse,
} from "../types/product";

export async function getProducts(
  limit: number,
  skip: number,
): Promise<ProductsResponse> {
  const response = await fetch(
    `https://dummyjson.com/products?limit=${limit}&skip=${skip}`,
  );

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju proizvoda");
  }

  return (await response.json()) as ProductsResponse;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`https://dummyjson.com/products/${id}`);

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju proizvoda.");
  }

  return (await response.json()) as Product;
}

export async function getAllProducts(): Promise<ProductsResponse> {
  const response = await fetch("https://dummyjson.com/products?limit=0");

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju proizvoda.");
  }

  return (await response.json()) as ProductsResponse;
}

export async function searchProducts(
  query: string,
): Promise<ProductsResponse> {
  const response = await fetch(
    `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=0`,
  );

  if (!response.ok) {
    throw new Error("Greška pri pretraživanju proizvoda.");
  }

  return (await response.json()) as ProductsResponse;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    "https://dummyjson.com/products/categories",
  );

  if (!response.ok) {
    throw new Error("Greška pri dohvaćanju kategorija.");
  }

  return (await response.json()) as Category[];
}

