import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

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
    const message = unauthorizedMessage ?? defaultMessage;

    setError("root", {
      type: "server",
      message,
    });

    toast.error(message);

    return {
      type: "unauthorized",
      message,
    };
  }

  if (error.response?.status === 422) {
    const errors = error.response.data.errors;

    Object.entries(errors).forEach(([field, messages]) => {
      setError(field, {
        type: "server",
        message: messages[0],
      });
    });

    toast.error("Please correct the highlighted fields.");

    return {
      type: "validation",
      message: "Please correct the highlighted fields.",
    };
  }

  setError("root", {
    type: "server",
    message: defaultMessage,
  });

  return {
    type: "error",
    message: defaultMessage,
  };
}
