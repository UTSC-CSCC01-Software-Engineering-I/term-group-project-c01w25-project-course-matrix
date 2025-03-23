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

interface TimetableErrorDialogProps {
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const TimetableErrorDialog: React.FC<TimetableErrorDialogProps> = ({ errorMessage, setErrorMessage }) => {
  const dialogTitle = errorMessage !== null ? errorMessage : "Unknown error occurred";
  const dialogDescription = errorMessage?.includes("title already exists") ? "Please choose another title for your timetable" : null;

  return (
    <Dialog
      open={errorMessage !== null}
      onOpenChange={() => setErrorMessage(null)}
    >
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle className="text-red-500">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => setErrorMessage(null)}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableErrorDialog;
