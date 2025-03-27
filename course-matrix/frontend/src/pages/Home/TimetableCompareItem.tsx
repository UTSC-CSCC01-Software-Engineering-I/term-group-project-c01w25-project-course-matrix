import { SemesterIcon } from "@/components/semester-icon";
import { SelectItem } from "@/components/ui/select";
import { Timetable } from "@/utils/type-utils";
import { Badge } from "@/components/ui/badge"
import { useGetUsernameFromUserIdQuery } from "@/api/authApiSlice";
import { useEffect, useState } from "react";

interface TimetableCompareItemProps {
    timetable: Timetable;
  }

const TimetableCompareItem = ({
  timetable,
}: TimetableCompareItemProps) => {
    const { data: usernameData } = useGetUsernameFromUserIdQuery(timetable.user_id);
    const [username, setUsername] = useState<string | null>("");
    const [loadedUsername, setLoadedUsername] = useState(false);

    useEffect(() => {
        if (usernameData !== undefined && !loadedUsername) {
            setUsername(usernameData ?? "John Doe");
            setLoadedUsername(true);
        }
    }, [loadedUsername, usernameData]);

    return <SelectItem key={`timetable2/${timetable.id}/${timetable.user_id}`} value={`timetable2/${timetable.id}/${timetable.user_id}`}>
                <div className="flex flex-row justify-between gap-2">
                    <span className="flex items-center gap-2">
                        <SemesterIcon
                            semester={timetable.semester}
                            size={18}
                        />
                        <span>{timetable.timetable_title}</span>
                    </span>
                    <Badge variant="secondary">Owner: {username}</Badge>
                </div>
            </SelectItem>
}

export default TimetableCompareItem;