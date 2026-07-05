import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

const authMock = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: authMock.useAuth,
}));

function renderProtectedRoute() {
  render(
    <MemoryRouter initialEntries={["/favorites"]}>
      <Routes>
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <p>Favorites page</p>
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects a guest user to the login page", () => {
    authMock.useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderProtectedRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("shows protected content to an authenticated user", () => {
    authMock.useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    renderProtectedRoute();

    expect(screen.getByText("Favorites page")).toBeInTheDocument();
  });
});