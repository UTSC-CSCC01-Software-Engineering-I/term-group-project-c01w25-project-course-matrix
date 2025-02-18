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

/**
 * OfferingContent Component
 *
 * Displays the available course offerings for a selected course and semester.
 * It fetches offering data from the backend using RTK Query (`useGetOfferingsQuery`) and 
 * renders a table with section details.
 *
 * Features:
 * - **Data Fetching**: Calls `useGetOfferingsQuery` to retrieve course offerings based on `course_code` and `semester`.
 * - **Loading State**: Displays a loading message while fetching data.
 * - **Table Display**:
 *   - Shows section details including time, location, instructor, capacity, and delivery mode.
 *   - Handles optional fields gracefully (e.g., empty values).
 * - **Waitlist Handling**: Indicates whether a section has a waitlist (`Y` or `N`).
 *
 * Props:
 * - `item` (`CourseModel`): The selected course whose offerings are displayed.
 * - `semester` (`string`): The semester for which course offerings are fetched.
 *
 * Hooks:
 * - `useGetOfferingsQuery` for fetching offerings.
 *
 * UI Components:
 * - `Table`, `TableRow`, `TableCell` for structured tabular display.
 *
 * @returns {JSX.Element} The rendered table of course offerings.
 */

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
