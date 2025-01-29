import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const LoginPage = () => {
  return <>
    <Card className="w-[350px] p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Test</h1>
        <h2 className="text-sm text-slate-500">Subtext</h2>
        <Label htmlFor="name">Name</Label>
        <Input placeholder="input text"/>
        <div className="w-full flex flex-row justify-between">
          <Button variant="outline">Click me</Button>
          <Button>Click me</Button>
        </div>
      </div>
    </Card>
  </>
}

export default LoginPage