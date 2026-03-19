import { useState, useCallback } from "react";

interface UseApiOptions<TData> {
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: HeadersInit;
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
}

interface UseApiResponse<TData, TBody> {
    data: TData | null;
    error: string | null;
    isLoading: boolean;
    execute: (body?: TBody, overrideUrl?: string) => Promise<TData | null>;
    reset: () => void;
}

export function useApi<TData = unknown, TBody = unknown>({
    url,
    method = "GET",
    headers,
    onSuccess,
    onError,
}: UseApiOptions<TData>): UseApiResponse<TData, TBody> {
    const [data, setData] = useState<TData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback(
        async (body?: TBody, overrideUrl?: string): Promise<TData | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const targetUrl = overrideUrl || url;
                const response = await fetch(targetUrl, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        ...headers,
                    },
                    body: body ? JSON.stringify(body) : undefined,
                });

                let result: TData | { message: string; error?: string };

                // Handle non-JSON responses gracefully
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    result = await response.json();
                } else {
                    result = { message: response.statusText };
                }

                if (!response.ok) {
                    const errorObj = result as {
                        message?: string;
                        error?: string;
                    };
                    throw new Error(
                        errorObj.message ||
                            errorObj.error ||
                            "An error occurred during the request",
                    );
                }

                setData(result as TData);
                if (onSuccess) onSuccess(result as TData);
                return result as TData;
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred";
                setError(errorMessage);
                if (onError) onError(errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [url, method, headers, onSuccess, onError],
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return { data, error, isLoading, execute, reset };
}
