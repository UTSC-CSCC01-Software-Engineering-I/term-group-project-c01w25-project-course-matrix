import { Spinner } from "@/components/ui/spinner";

const LoadingPage = () => {
  return (
    <div className="w-screen flex flex-col gap-4 justify-center -translate-y-12 items-center h-screen bg-gray-100">
      <Spinner />
    </div>
  );
};

export default LoadingPage;
