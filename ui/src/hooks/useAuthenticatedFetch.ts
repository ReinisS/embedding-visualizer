import { useAuth } from "@clerk/nextjs";

export default function useAuthenticatedFetch() {
  const { getToken } = useAuth();

  const authenticatedFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = await getToken();

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      return res.json() as Promise<T>;
    });
  };

  return authenticatedFetch;
}
