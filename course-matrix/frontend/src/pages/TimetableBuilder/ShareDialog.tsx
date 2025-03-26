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
import TimetableSuccessDialog from "./TimetableSuccessDialog";
import { Spinner } from "@/components/ui/spinner";

interface ShareDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  calendar_id: number;
}

const ShareDialog = ({ open, setOpen, calendar_id }: ShareDialogProps) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const [shareTimetable] = useCreateShareMutation();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleShare = async () => {
    setLoading(true);
    const email = emailRef.current?.value;
    const { error } = await shareTimetable({
      shared_email: email,
      calendar_id,
    });
    if (error) {
      const errorData = (error as { data?: { error?: string } }).data;
      setErrorMessage(errorData?.error ?? "Unknown error occurred");
    } else {
      setSuccessMessage("Timetable shared successfully!");
      setOpen(false);
      setErrorMessage(null);
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        setErrorMessage(null);
      }}
    >
      <TimetableSuccessDialog
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
      />
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle>Share Timetable</DialogTitle>
          <DialogDescription>
            Who would you like to share your timetable with?
          </DialogDescription>
        </DialogHeader>
        {loading && <Spinner />}
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
        <DialogDescription className="text-red-500">
          {errorMessage}
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleShare}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
