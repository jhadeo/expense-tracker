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

import { registerSchema } from "@/schemas/registerSchema";
import api from "@/api/axios";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const response = await api.post("/register", data);

      localStorage.setItem("token", response.data.token);

      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;

        Object.entries(serverErrors).forEach(([field, messages]) => {
          setError(field, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        setError("root", {
          type: "server",
          message: "Login failed. Please try again.",
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Register</CardTitle>
          <CardDescription className="text-center">
            Fill out your details to create your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup  className={"grid grid-cols-2 w-full"}>
            {errors.root && (
              <p className="text-sm text-red-600 text-center col-span-2">
                {errors.root.message}
              </p>
            )}
            <Field>
              <FieldLabel htmlFor="first_name">First Name</FieldLabel>
              <Input
                type="text"
                id="first_name"
                placeholder="John"
                {...register("first_name")}
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">
                  {errors.first_name.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
              <Input
                type="text"
                id="last_name"
                placeholder="Smith"
                {...register("last_name")}
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">
                  {errors.last_name.message}
                </p>
              )}
            </Field>
            <Field className={"col-span-2"}>
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
            <Field className={"col-span-2"}>
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
            <Field className={"col-span-2"}>
              <FieldLabel htmlFor="password_confirmation">
                Confirm Password
              </FieldLabel>
              <Input
                type="password"
                id="password_confirmation"
                placeholder="Confirm your password"
                {...register("password_confirmation")}
                aria-invalid={!!errors.password_confirmation}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-600">
                  {errors.password_confirmation.message}
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
                  <Spinner /> Please wait...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </form>
  );
}
