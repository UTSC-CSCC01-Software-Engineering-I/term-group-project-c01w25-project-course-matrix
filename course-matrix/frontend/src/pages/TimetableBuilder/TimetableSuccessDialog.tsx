import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import React from "react";

interface TimetableSuccessDialogProps {
  successMessage: string | null;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const TimetableSuccessDialog: React.FC<TimetableSuccessDialogProps> = ({
  successMessage,
  setSuccessMessage,
}) => {
  const dialogTitle =
    successMessage !== null ? successMessage : "Unknown error occurred";
  const dialogDescription = successMessage?.includes("title already exists")
    ? "Please choose another title for your timetable"
    : null;

  return (
    <Dialog
      open={successMessage !== null}
      onOpenChange={() => setSuccessMessage(null)}
    >
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle className="text-green-500">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => setSuccessMessage(null)}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableSuccessDialog;
