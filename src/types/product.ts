export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  images: string[];
  rating: number;
  category: string;
  stock: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}