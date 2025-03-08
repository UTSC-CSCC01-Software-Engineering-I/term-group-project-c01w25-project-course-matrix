import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Component for the "Create New" button that navigates to the timetable creation page.
 * @returns {JSX.Element} The rendered component.
 */
const TimetableCreateNewButton = () => (
  <Link to="/dashboard/timetable">
    <Button size="sm" className="px-5">
      Create New
      <Plus />
    </Button>
  </Link>
);

export default TimetableCreateNewButton;
