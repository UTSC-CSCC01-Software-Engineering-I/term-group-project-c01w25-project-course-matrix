import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const LoginPage = () => {
  return <div
  className="flex justify-center items-center h-screen">
    <Card className="w-[350px] p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Please Login or Signup</h1>
        <h2 className="text-sm text-slate-500">If you have an account please log in, if you do not have an account please sign up.</h2>
        <Label htmlFor="Username">Username</Label>
        <Input id="UsernameInput" placeholder="Input user name"/>
        <Label id="PasswordInput"htmlFor="Password">Password</Label>
        <Input placeholder="input user password"/>
        <div className="w-full flex flex-row justify-between">
          <Button id="LoginBtn">Login</Button>
          <h2 className="text-xl font-bold">Or</h2>
          <Button id="SigningUpbtn">Sign Up</Button>
        </div>
      </div>
    </Card>
  </div>
}

export default LoginPage