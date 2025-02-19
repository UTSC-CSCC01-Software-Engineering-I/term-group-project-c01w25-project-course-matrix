import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";

const SignupSuccessfulPage = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="w-screen flex flex-col gap-4 justify-center -translate-y-12 items-center h-screen bg-gray-100">
      <Logo />
      <Card className="flex flex-col items-center text-center p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold">Account created!</h1>
          <h2 className="text-sm text-slate-500">
            You have successfully created an account for Course Matrix.
          </h2>
          <Button onClick={handleRedirect}>Log in</Button>
        </div>
      </Card>
    </div>
  );
};

export default SignupSuccessfulPage;
