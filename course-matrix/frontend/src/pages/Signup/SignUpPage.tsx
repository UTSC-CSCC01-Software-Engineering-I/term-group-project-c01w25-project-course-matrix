import { useLoginMutation, useSignupMutation } from "@/api/authApiSlice"
import Logo from "@/components/logo"
import PasswordInput from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SignupFormSchema } from "@/models/signup-form"
import { setCredentials } from "@/stores/authslice"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { z } from "zod"

const SignupPage = () => {

  const signupForm = useForm<z.infer<typeof SignupFormSchema>>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const [ signup ] = useSignupMutation()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCheckEmail, setShowCheckEmail] = useState(false)
  const [showUserExists, setShowUserExists] = useState(false)
  const [showSignupError, setShowSignupError] = useState(false)

  const onSubmit = async (values: z.infer<typeof SignupFormSchema>) => {
    if(isSubmitting) return;
    setIsSubmitting(true)
    setShowCheckEmail(false)
    setShowUserExists(false)
    setShowSignupError(false)
    try {
      const { data, error } = await signup(signupForm.getValues())
      console.log(data)
      if (error) {
        if ((error as any)?.data?.error?.message === "User already exists") {
          setShowUserExists(true)
        }
        else {
          setShowSignupError(true)
        }
      } else {
        setShowCheckEmail(true)
      }
    } catch (err) {
      setShowSignupError(true)
      console.error(err)
    }
    setIsSubmitting(false)
    
  }

  return <div className="w-screen flex flex-col gap-4 justify-center -translate-y-12 items-center h-screen bg-gray-100">
    <Logo />
    <Card className="flex flex-col items-center text-center p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <h2 className="text-sm text-slate-500">Sign up to Course Matrix with your email</h2>
        <Form {...signupForm}>
          <form onSubmit={signupForm.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
              control={signupForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="text-left w-[400px]">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} id="UsernameInput" placeholder="User123"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={signupForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="text-left w-[400px]">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} id="EmailInput" placeholder="someone@test.com"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <PasswordInput 
              form={signupForm} 
              name="password"
              label="Create Password"
              placeholder="Enter password" 
              className="w-full" 
            />
            <PasswordInput 
              form={signupForm} 
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm password" 
              className="w-full" 
            />
            {showCheckEmail && <p className="text-sm text-slate-500 w-[400px]">Registration successful! Please check {signupForm.getValues("email")} for a confirmation link</p>}
            {showUserExists && <p className="text-sm text-red-500 w-[400px]">User with email {signupForm.getValues("email")} already exists!</p>}
            {showSignupError && <p className="text-sm text-red-500 w-[400px]">An unknown error occured. Please try again.</p>}
            <div className="w-full flex flex-row justify-center">
              <Button id="LoginBtn" className="w-full" type="submit" variant={isSubmitting ? "ghost" : "default"}>Sign up</Button>
            </div>
          </form>
        </Form>

        <Label id="GogtoSignup" htmlFor="go to Signup" className="flex flex-row justify-center gap-1 m-2">
          <p>Have an account?</p>
          <Link to="/login"><p className="underline">Log in!</p></Link>
        </Label>
      </div>
    </Card>
  </div>
}

export default SignupPage
