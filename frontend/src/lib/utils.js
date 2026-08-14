import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function handleApiFormError({
  error,
  setError,
  defaultMessage,
  unauthorizedMessage,
}) {
  if (error.response?.status === 401) {
    setError("root", {
      type: "server",
      message: unauthorizedMessage ?? defaultMessage,
    });
    return;
  }

  if (error.response?.status === 422) {
    const errors = error.response.data.errors;

    Object.entries(errors).forEach(([field, messages]) => {
      setError(field, {
        type: "server",
        message: messages[0],
      });
    });

    return;
  }

  setError("root", {
    type: "server",
    message: defaultMessage,
  });
}
