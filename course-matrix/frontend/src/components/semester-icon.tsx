import { Leaf, Snowflake, Sun } from "lucide-react";

interface SemesterIconProps {
  semester: string;
  size?: number
}

export const SemesterIcon = ({semester, size}: SemesterIconProps) => {
  return <>
    {semester === "Summer 2025" ? 
      <Sun className="text-yellow-500" size={size}/> :
      semester === "Fall 2025" ? 
      <Leaf className="text-orange-500" size={size}/> :
      <Snowflake className="text-blue-500" size={size}/>
      }
  </>
}