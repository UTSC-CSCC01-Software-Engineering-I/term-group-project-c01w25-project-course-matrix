import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const LoginPage = () => {
  return <div className="w-screen flex justify-center items-center h-screen bg-gray-100">
    <Card className="w-[400px] flex flex-col items-center p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Please Login</h1>
        <h2 className="text-sm text-slate-500">If you have an account please log in. Input your email that you've registered, and your password</h2>
        <Label htmlFor="Email">Email</Label>
        <Input id="EmailInput" placeholder="someone@test.com"/>
        <Label htmlFor="Password">Password</Label>
        <Input id="PasswordInput"  placeholder="Password"/>
        <div className="w-full flex flex-row justify-center">
          <Button id="LoginBtn" className="w-full">Login</Button>
        </div>
        <Label id="GogtoSignup" htmlFor="go to Signup">Don't have an account? Signup!</Label>
        <div className="w-full flex flex-row justify-center">
          <Button id="SigningUpbtn" className="w-full">Sign Up</Button>
        </div>
      </div>
    </Card>
  </div>
}

export default LoginPage
