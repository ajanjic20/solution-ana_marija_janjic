import { Navigate, Route, Routes } from "react-router";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductsPage } from "./pages/ProductsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}

export default App;