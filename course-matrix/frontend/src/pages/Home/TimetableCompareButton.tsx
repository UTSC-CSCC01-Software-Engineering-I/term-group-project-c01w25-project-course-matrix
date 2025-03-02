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

const TimetableCompareDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button size="sm" className="px-5 bg-black hover:bg-gray-700">
        Compare
      </Button>
    </DialogTrigger>
    <DialogContent className="gap-5">
      <DialogHeader>
        <DialogTitle>Compare Timetables</DialogTitle>
        <DialogDescription>Compare 2 of your timetables</DialogDescription>
      </DialogHeader>
      <Label htmlFor="timetable1">First Timetable Name</Label>
      <Input id="timetable1" placeholder="Placeholder name" disabled />
      <Label htmlFor="timetable2">Second Timetable Name</Label>
      <Input id="timetable2" placeholder="Placeholder name" disabled />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button>Compare</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default TimetableCompareDialog;
