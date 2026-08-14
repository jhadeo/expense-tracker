import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { loginSchema } from "@/schemas/loginSchema";
import api from "@/api/axios";
import { handleApiFormError } from "@/lib/utils";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const response = await api.post("/login", data);

      localStorage.setItem("token", response.data.token);

      navigate("/dashboard");
    } catch (error) {
      handleApiFormError({
        error,
        setError,
        defaultMessage: "Login failed. Please try again.",
        unauthorizedMessage:
          "Invalid email or password.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            {errors.root && (
              <p className="text-sm text-red-600 text-center">
                {errors.root.message}
              </p>
            )}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                id="email"
                placeholder="john@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Field orientation="horizontal" className="flex justify-end-safe">
            <Button type="button" variant="secondary" onClick={() => reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner /> Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </form>
  );
}
