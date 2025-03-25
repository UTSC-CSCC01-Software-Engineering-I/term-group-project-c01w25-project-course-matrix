import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { useCreateShareMutation } from "@/api/sharedApiSlice";
import TimetableErrorDialog from "./TimetableErrorDialog";
import TimetableSuccessDialog from "./TimetableSuccessDialog";

interface ShareButtonProps {
  calendar_id: number;
}

const ShareButton = ({ calendar_id }: ShareButtonProps) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const [shareTimetable] = useCreateShareMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleShare = async () => {
    const email = emailRef.current?.value;

    const { error } = await shareTimetable({
      shared_email: email,
      calendar_id,
    });
    if (error) {
      const errorData = (error as { data?: { error?: string } }).data;
      setErrorMessage(errorData?.error ?? "Unknown error occurred");
      return;
    } else {
      setSuccessMessage("Timetable shared successfully!");
    }
  };

  return (
    <Dialog>
      <TimetableErrorDialog
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <TimetableSuccessDialog
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
      />
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle>Share Timetable</DialogTitle>
          <DialogDescription>
            Who would you like to share your timetable with?
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="sharedEmail">
          Enter the email of the person you want to share your timetable with
        </Label>
        <Input
          id="sharedEmail"
          ref={emailRef}
          type="email"
          placeholder="Email"
          className="w-full"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleShare}>Share</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;
