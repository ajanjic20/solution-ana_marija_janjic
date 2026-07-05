import { Navigate, Route, Routes } from "react-router";
import { Header } from "./components/Header";
import { FavoritesPage } from "./pages/FavoritesPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/products" replace />}
        />

        <Route path="/products" element={<ProductsPage />} />

        <Route
          path="/products/:id"
          element={<ProductDetailPage />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/products" replace />}
        />
      </Routes>
    </>
  );
}

export default App;