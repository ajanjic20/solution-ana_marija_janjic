import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProductById } from "../api/productsApi";
import { ProductDetailPage } from "./ProductDetailPage";

vi.mock("../api/productsApi", () => ({
  getProductById: vi.fn(),
}));

vi.mock("../components/FavoriteButton", () => ({
  FavoriteButton: () => (
    <button type="button">
      Favorite
    </button>
  ),
}));

const mockedGetProductById = vi.mocked(getProductById);

function renderProductDetailPage(path = "/products/1") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/products/:id"
          element={<ProductDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading message while the product is loading", () => {
    mockedGetProductById.mockImplementation(
      () => new Promise(() => {}),
    );

    renderProductDetailPage();

    expect(
      screen.getByText("Učitavanje detalja proizvoda..."),
    ).toBeInTheDocument();
  });

  it("shows product details after a successful request", async () => {
    mockedGetProductById.mockResolvedValue({
      id: 1,
      title: "Test product",
      description: "This is a test product description.",
      price: 25,
      thumbnail: "https://example.com/product.jpg",
      images: [
        "https://example.com/product.jpg",
        "https://example.com/product-second.jpg",
      ],
      rating: 4.5,
      category: "beauty",
      stock: 10,
    });

    renderProductDetailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Test product",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("This is a test product description."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("★ 4.5 / 5"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("10 komada dostupno"),
    ).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    mockedGetProductById.mockRejectedValue(
      new Error("Request failed"),
    );

    renderProductDetailPage();

    expect(
      await screen.findByText(
        "Došlo je do pogreške pri učitavanju detalja proizvoda.",
      ),
    ).toBeInTheDocument();
  });
});