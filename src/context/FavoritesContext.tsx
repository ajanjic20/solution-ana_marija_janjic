import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types/product";
import { useAuth } from "./AuthContext";

interface FavoritesContextValue {
  favorites: Product[];
  isFavorite: (productId: number) => boolean;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (product: Product) => void;
}

const FavoritesContext = createContext<
  FavoritesContextValue | undefined
>(undefined);

function getStorageKey(userId: number): string {
  return `favorites-${userId}`;
}

function readFavorites(userId: number): Product[] {
  const storedFavorites = localStorage.getItem(
    getStorageKey(userId),
  );

  if (!storedFavorites) {
    return [];
  }

  try {
    const parsedFavorites: unknown = JSON.parse(storedFavorites);

    return Array.isArray(parsedFavorites)
      ? (parsedFavorites as Product[])
      : [];
  } catch {
    localStorage.removeItem(getStorageKey(userId));
    return [];
  }
}

function saveFavorites(
  userId: number,
  favorites: Product[],
): void {
  localStorage.setItem(
    getStorageKey(userId),
    JSON.stringify(favorites),
  );
}

export function FavoritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id;

  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    if (userId === undefined) {
      setFavorites([]);
      return;
    }

    setFavorites(readFavorites(userId));
  }, [userId]);

  const value = useMemo<FavoritesContextValue>(() => {
    function addFavorite(product: Product) {
      if (userId === undefined) {
        return;
      }

      setFavorites((currentFavorites) => {
        const alreadyExists = currentFavorites.some(
          (favorite) => favorite.id === product.id,
        );

        if (alreadyExists) {
          return currentFavorites;
        }

        const nextFavorites = [product, ...currentFavorites];

        saveFavorites(userId, nextFavorites);

        return nextFavorites;
      });
    }

    function removeFavorite(productId: number) {
      if (userId === undefined) {
        return;
      }

      setFavorites((currentFavorites) => {
        const nextFavorites = currentFavorites.filter(
          (favorite) => favorite.id !== productId,
        );

        saveFavorites(userId, nextFavorites);

        return nextFavorites;
      });
    }

    function isFavorite(productId: number): boolean {
      return favorites.some(
        (favorite) => favorite.id === productId,
      );
    }

    function toggleFavorite(product: Product) {
      if (isFavorite(product.id)) {
        removeFavorite(product.id);
        return;
      }

      addFavorite(product);
    }

    return {
      favorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    };
  }, [favorites, userId]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites mora biti korišten unutar FavoritesProvider komponente.",
    );
  }

  return context;
}