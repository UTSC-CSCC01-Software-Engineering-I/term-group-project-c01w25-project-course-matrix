import { useGetOfferingsQuery } from "@/api/offeringsApiSlice";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CourseModel, OfferingModel } from "@/models/models";

interface OfferingContentProps {
  item: CourseModel;
  semester: string;
}

const OfferingContent = ({ item, semester }: OfferingContentProps) => {
  const { data, isLoading, error, refetch } = useGetOfferingsQuery({
    course_code: item.code,
    semester: semester,
  });

  return (
    <>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="p-2 max-h-[400px] overflow-y-auto">
          <Table className="w-[1000px] text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>Meeting Section</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Max</TableHead>
                <TableHead>Waitlist?</TableHead>
                <TableHead>Delivery Mode</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data as OfferingModel[]).map((offering, index) => (
                <TableRow>
                  <TableCell className="font-medium">
                    {offering.meeting_section}
                  </TableCell>
                  <TableCell>{offering.day ?? ""}</TableCell>
                  <TableCell>{`${offering.start ?? ""} - ${offering.end ?? ""}`}</TableCell>
                  <TableCell>{offering.location ?? ""}</TableCell>
                  <TableCell>{offering.current ?? ""}</TableCell>
                  <TableCell>{offering.max ?? ""}</TableCell>
                  <TableCell>{offering.is_waitlisted ? "N" : "Y"}</TableCell>
                  <TableCell>{offering.delivery_mode ?? ""}</TableCell>
                  <TableCell>{offering.instructor ?? ""}</TableCell>
                  <TableCell>{offering.notes ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default OfferingContent;
