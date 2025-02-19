import { useLoginMutation } from "@/api/authApiSlice";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginFormSchema } from "@/models/login-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { setCredentials } from "@/stores/authslice";
import { useDispatch } from "react-redux";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PasswordInput from "@/components/password-input";
import { useState } from "react";

/**
 * LoginPage Component
 *
 * Provides a login form for users to authenticate using their email and password.
 * It utilizes React Hook Form with Zod form validation and uses Redux Toolkit to access localstorage
 *  for authentication state management.
 *
 * Features:
 * - **Form Validation**: Uses `react-hook-form` with `zodResolver` to validate user input based on `LoginFormSchema`.
 * - **API Integration**: Calls `useLoginMutation` from `authApiSlice` to login users.
 * - **State Management**: Uses Redux to store user credentials in localstorage upon successful login.
 * - **Error Handling**: Displays an error message if the login credentials are invalid.
 * - **Navigation**: Redirects users to `/dashboard/home` upon successful login.
 *
 * Hooks:
 * - `useForm` for form handling.
 * - `useLoginMutation` for login API call.
 * - `useDispatch` for Redux actions.
 * - `useNavigate` for client-side navigation.
 * - `useState` to manage form submission state and invalid credentials.
 *
 * UI Components:
 * - `Logo`, `Card`, `Button`, `Input`, `PasswordInput` for form UI.
 * - `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` for structured form handling.
 *
 * @returns {JSX.Element} The rendered login page.
 */
const LoginPage = () => {
  const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [login] = useLoginMutation();
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const onSubmit = async (values: z.infer<typeof LoginFormSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setInvalidCredentials(false);
    try {
      const { data, error } = await login(loginForm.getValues());
      console.log("Login", data, error);

      if (!error) {
        // Set user details to localstorage
        dispatch(setCredentials(data));

        // Go to dashboard
        navigate("/dashboard/home");
      } else {
        if (
          (error as any).status === 401 &&
          (error as any)?.data?.code === "invalid_credentials"
        ) {
          setInvalidCredentials(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-screen flex flex-col gap-4 justify-center -translate-y-12 items-center h-screen bg-gray-100">
      <Logo />
      <Card className="flex flex-col items-center text-center p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold">Login</h1>
          <h2 className="text-sm text-slate-500">
            Login with your email and password
          </h2>
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="text-left w-[400px]">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="EmailInput"
                        placeholder="someone@test.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PasswordInput
                form={loginForm}
                name="password"
                label="Password"
                placeholder="Enter password"
                className="w-full"
              />

              {invalidCredentials && (
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Login invalid. Please check your email or password.
                  </p>
                </div>
              )}

              <div className="w-full flex flex-row justify-center">
                <Button
                  id="LoginBtn"
                  className="w-full"
                  variant={isSubmitting ? "ghost" : "default"}
                  type="submit"
                >
                  Login
                </Button>
              </div>
            </form>
          </Form>

          <Label
            id="GogtoSignup"
            htmlFor="go to Signup"
            className="flex flex-row justify-center gap-1 m-2"
          >
            <p>Don't have an account?</p>
            <Link to="/signup">
              <p className="underline">Sign up!</p>
            </Link>
          </Label>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
