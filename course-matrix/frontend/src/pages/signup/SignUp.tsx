import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SignupPage = () => {
  return <div className="w-screen flex justify-center items-center h-screen bg-gray-100">
    <Card className="w-[400px] flex flex-col items-center p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Please Signup</h1>
        <h2 className="text-sm text-slate-500">Input the email you want registered and the password you want.</h2>
        <Label htmlFor="Email">Email</Label>
        <Input id="EmailInput" placeholder="someone@test.com"/>
        <Label htmlFor="Password">Password</Label>
        <Input id="PasswordInput"  placeholder="Password"/>
        <div className="w-full flex flex-row justify-center">
          <Button id="RealSigningUpbtn" className="w-full">Sign Up</Button>
        </div>
        <Label id="GogtoSignup" htmlFor="go to Signup">Already have an account? Login!</Label>
        <div className="w-full flex flex-row justify-center">
          <Button id="LoginBtn" className="w-full">Login</Button>
        </div>
      </div>
    </Card>
  </div>
}

export default SignupPage
