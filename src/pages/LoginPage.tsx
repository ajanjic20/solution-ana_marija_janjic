import {
  useState,
  type SubmitEvent,
} from "react";
import {
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useAuth } from "../context/AuthContext";

function getSafeRedirect(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/products";
  }

  return value;
}

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = getSafeRedirect(
    searchParams.get("redirect"),
  );

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        username: username.trim(),
        password,
      });

      navigate(redirectTo, {
        replace: true,
      });
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Prijava trenutačno nije moguća.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-8 pt-10">
      <div className="mx-auto max-w-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Korisnički račun
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Prijava
        </h1>

        <div className="mt-5 border border-blue-100 p-4 text-sm text-slate-700">
          <p className="font-semibold">Demo podaci</p>
          <p className="mt-1">
            Korisničko ime: <strong>emilys</strong>
          </p>
          <p>
            Lozinka: <strong>emilyspass</strong>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Korisničko ime
            </label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
              className="w-full border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Lozinka
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              className="w-full border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p
              className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
          >
            {isSubmitting ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </form>
      </div>
    </main>
  );
}