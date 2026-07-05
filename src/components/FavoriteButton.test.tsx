import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoriteButton } from "./FavoriteButton";
import type { Product } from "../types/product";

const authMock = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

const favoritesMock = vi.hoisted(() => ({
  useFavorites: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: authMock.useAuth,
}));

vi.mock("../context/FavoritesContext", () => ({
  useFavorites: favoritesMock.useFavorites,
}));

const testProduct: Product = {
  id: 1,
  title: "Test perfume",
  description: "A product used for testing favorites.",
  price: 25,
  thumbnail: "https://example.com/product.jpg",
  images: ["https://example.com/product.jpg"],
  rating: 4.5,
  category: "beauty",
  stock: 10,
};

function renderFavoriteButton() {
  render(
    <MemoryRouter>
      <FavoriteButton product={testProduct} />
    </MemoryRouter>,
  );
}

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    authMock.useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    favoritesMock.useFavorites.mockReturnValue({
      isFavorite: vi.fn().mockReturnValue(false),
      toggleFavorite: vi.fn(),
    });
  });

  it("shows a login prompt when a guest clicks the favorite button", async () => {
    const user = userEvent.setup();

    renderFavoriteButton();

    await user.click(
      screen.getByRole("button", {
        name: "Dodaj Test perfume u favorite",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Prijava za favorite",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Prijavite se za favorite"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Prijava",
      }),
    ).toBeInTheDocument();
  });

  it("adds a product to favorites when a logged-in user clicks the heart", async () => {
    const user = userEvent.setup();
    const toggleFavorite = vi.fn();

    authMock.useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    favoritesMock.useFavorites.mockReturnValue({
      isFavorite: vi.fn().mockReturnValue(false),
      toggleFavorite,
    });

    renderFavoriteButton();

    await user.click(
      screen.getByRole("button", {
        name: "Dodaj Test perfume u favorite",
      }),
    );

    expect(toggleFavorite).toHaveBeenCalledWith(testProduct);
  });

  it("shows a filled heart for a product that is already a favorite", () => {
    authMock.useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    favoritesMock.useFavorites.mockReturnValue({
      isFavorite: vi.fn().mockReturnValue(true),
      toggleFavorite: vi.fn(),
    });

    renderFavoriteButton();

    const button = screen.getByRole("button", {
      name: "Ukloni Test perfume iz favorita",
    });

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("♥");
  });
});