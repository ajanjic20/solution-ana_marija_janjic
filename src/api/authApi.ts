import type {
  LoginCredentials,
  LoginResponse,
} from "../types/auth";

export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await fetch(
    "https://dummyjson.com/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...credentials,
        expiresInMins: 60,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Korisničko ime ili lozinka nisu ispravni.",
    );
  }

  return (await response.json()) as LoginResponse;
}