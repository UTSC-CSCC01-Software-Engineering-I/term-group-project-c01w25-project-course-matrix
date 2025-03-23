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
    isCreating: boolean;
    errorMessage: string | null;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const TimetableErrorDialog: React.FC<TimetableErrorDialogProps> = ({ isCreating, errorMessage, setErrorMessage }) => {
    const dialogTitle = isCreating ? "An error occurred while creating your timetable" : "An error occurred while updating your timetable";

    return (
        <Dialog open={errorMessage !== null} onOpenChange={() => setErrorMessage(null)}>
            <DialogContent className="gap-5">
            <DialogHeader>
                <DialogTitle className="text-red-500">{dialogTitle}</DialogTitle>
                <DialogDescription>{errorMessage}</DialogDescription>
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