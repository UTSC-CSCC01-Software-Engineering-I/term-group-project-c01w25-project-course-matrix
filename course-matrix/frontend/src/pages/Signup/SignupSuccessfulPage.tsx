import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate, useLocation } from "react-router-dom";

/**
 * SignupSuccessfulPage Component
 *
 * Displays a confirmation message after a user successfully creates an account. 
 * Provides a button to navigate to the login page.
 *
 * Features:
 * - **Success Message**: Confirms account creation.
 * - **Navigation**: Redirects users to the login page via `useNavigate()`.
 *
 * Hooks:
 * - `useNavigate` for handling navigation.
 *
 * UI Components:
 * - `Logo` for branding.
 * - `Card` for structuring the confirmation message.
 * - `Button` for redirecting to login.
 *
 * @returns {JSX.Element} The signup success confirmation page.
 */

const SignupSuccessfulPage = () => {

  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/login')
  }
  
  return <div className="w-screen flex flex-col gap-4 justify-center -translate-y-12 items-center h-screen bg-gray-100">
    <Logo />
    <Card className="flex flex-col items-center text-center p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Account created!</h1>
        <h2 className="text-sm text-slate-500">You have successfully created an account for Course Matrix.</h2>
        <Button onClick={handleRedirect} >Log in</Button>
      </div>
    </Card>
  </div>
}

export default SignupSuccessfulPage