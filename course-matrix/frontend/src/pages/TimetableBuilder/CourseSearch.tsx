import { FilterIcon, Info, Search as SearchIcon } from "lucide-react"
import { Input } from "../../components/ui/input"
import { useContext, useEffect, useRef, useState } from "react"
import { CourseModel } from "@/models/models"
import { useClickOutside } from "@/utils/useClickOutside"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { convertBreadthRequirement } from "@/utils/convert-breadth-requirement"
import { FormContext } from "./TimetableBuilder"

interface CourseSearchProps {
  value: string,
  showFilter: () => void;
  onChange: (_: string) => void,
  data: CourseModel[],
}

const CourseSearch = ({
  value,
  showFilter,
  onChange,
  data,
}: CourseSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [showPanel, setShowPanel] = useState(false)
  useClickOutside(panelRef, () => setShowPanel(false), showPanel, inputRef)

  const form = useContext(FormContext)

  const handleAddCourse = (item: CourseModel) => {
    if (!form) return
    const currentList = form.getValues('courses') || [];
    if (currentList.find(c => c.id === item.id)) return // ensure uniqueness
    const newList = [...currentList, item]
    console.log(newList)
    form.setValue("courses", newList)
  }

  return (
    <div className="relative w-full">
      <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        ref={inputRef}
        value={value}
        placeholder="Search..."
        className="pl-10"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowPanel(true)}
      />
      <FilterIcon size={16} onClick={showFilter} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition cursor-pointer"/>
      {showPanel && (
        <div ref={panelRef} className="absolute top-full left-0 w-full bg-white shadow-md border rounded-md mt-2 p-2 z-[100]">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div 
                key={index} 
                onClick={() => handleAddCourse(item)} 
                className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center gap-1"
              >
                <div>
                  <p className="text-sm font-bold">{item.code}</p>
                  <p className="text-sm text-gray-500">{item.name}</p>
                </div>
                <HoverCard openDelay={50} closeDelay={0}>
                  <HoverCardTrigger >
                    <Info 
                      size={20} 
                      className="hover:text-green-500 transition duration-1"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent 
                    side="right" 
                    className="w-[280px] sm:w-[350px] md:w-[450px] lg:w-[500px] max-w-[90vw]"
                    sideOffset={10}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-sm flex flex-col gap-2">
                      <p className="text-lg font-bold">{item.code}: {item.name}</p>
                      <p>{item.description}</p>
                      <div>
                        <p><strong>Breadth Requirement: </strong> {convertBreadthRequirement(item.breadthRequirement ?? "")}</p>
                        {item.courseExperience && <p><strong>Course Experience: </strong> {item.courseExperience}</p>}
                        {item.prerequisiteDescription && <p><strong>Prerequisites: </strong> {item.prerequisiteDescription}</p>}
                        {item.corequisiteDescription && <p><strong>Corequisites: </strong> {item.corequisiteDescription}</p>}
                        {item.exclusionDescription && <p><strong>Course Experience: </strong> {item.exclusionDescription}</p>}
                        {item.recommendedPreperation && <p><strong>Recommended Preperation: </strong> {item.recommendedPreperation}</p>}
                        {item.note && <p><strong>Note: </strong> {item.note}</p>}
                        <a 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 underline"
                          href={`https://utsc.calendar.utoronto.ca/course/${item.code.toLowerCase()}`}
                        >Link to UTSC Course Calendar</a>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseSearch