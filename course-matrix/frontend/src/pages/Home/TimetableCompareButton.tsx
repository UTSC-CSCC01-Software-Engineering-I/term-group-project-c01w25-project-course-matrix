import { SemesterIcon } from "@/components/semester-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timetable } from "@/utils/type-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitCompareArrows } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import TimetableCompareItem from "./TimetableCompareItem";

export const CompareFormSchema = z.object({
  timetable1: z.string().nonempty(),
  timetable2: z.string().nonempty(),
});

interface TimetableCompareDialogProps {
  timetables: Timetable[];
}
/**
 * Component for the "Compare" button that opens a dialog to compare timetables.
 * @returns {JSX.Element} The rendered component.
 */
export const TimetableCompareButton = ({
  timetables,
}: TimetableCompareDialogProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const compareForm = useForm<z.infer<typeof CompareFormSchema>>({
    resolver: zodResolver(CompareFormSchema),
  });

  const onSubmit = (values: z.infer<typeof CompareFormSchema>) => {
    console.log("Compare Form submitted:", values);
    const timetableId1 = values.timetable1.split("/")[1];
    const timetableId2 = values.timetable2.split("/")[1];
    const userId1 = values.timetable1.split("/")[2];
    const userId2 = values.timetable2.split("/")[2];
    setOpen(false);
    navigate(
      `/dashboard/compare?id1=${timetableId1}&id2=${timetableId2}&userId1=${userId1}&userId2=${userId2}`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="px-5">
          Compare
          <GitCompareArrows />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle>Compare Timetables</DialogTitle>
          <DialogDescription>
            <div className="mt-2">View timetables side by side.</div>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
                <SemesterIcon semester="Summer 2025" size={18} />
                <span>Summer 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <SemesterIcon semester="Fall 2025" size={18} />
                <span>Fall 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <SemesterIcon semester="Winter 2026" size={18} />
                <span>Winter 2026</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Form {...compareForm}>
          <form
            onSubmit={compareForm.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={compareForm.control}
              name="timetable1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timetable 1</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timetable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timetables.map((timetable) => (
                        <TimetableCompareItem
                          key={`timetable1/${timetable.id}/${timetable.user_id}`}
                          timetable={timetable}
                        />
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={compareForm.control}
              name="timetable2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timetable 2</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timetable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timetables.map((timetable) => (
                        <TimetableCompareItem
                          key={`timetable2/${timetable.id}/${timetable.user_id}`}
                          timetable={timetable}
                        />
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
