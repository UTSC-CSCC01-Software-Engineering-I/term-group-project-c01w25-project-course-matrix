import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  BreadthRequirementEnum,
  FilterForm,
  FilterFormSchema,
} from "@/models/filter-form";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertBreadthRequirement } from "@/utils/convert-breadth-requirement";
import { SemesterEnum } from "@/models/timetable-form";
import { useGetDepartmentsQuery } from "@/api/departmentsApiSlice";
import { DepartmentModel } from "@/models/models";

interface SearchFiltersProps {
  closeHandler: () => void;
  submitHandler: (values: z.infer<typeof FilterFormSchema>) => void;
  resetHandler: () => void;
  filterForm: UseFormReturn<FilterForm, any, undefined>;
}

/**
 * SearchFilters Component
 *
 * Provides filtering options for refining course search results. Users can filter courses 
 * based on breadth requirement, credit weight, department, and year level.
 *
 * Features:
 * - **Breadth Requirement Filtering**: Users can filter courses by breadth category.
 * - **Credit Weight Selection**: Allows users to filter courses based on credit weight (1.0 or 0.5).
 * - **Department Filtering**: Fetches department data dynamically using `useGetDepartmentsQuery`.
 * - **Year Level Selection**: Enables filtering by course year level (1 to 4).
 * - **Form Handling**:
 *   - Uses `react-hook-form` with `zodResolver` for validation.
 *   - Resets filters with a `Reset` button.
 *   - Submits selected filters using `Apply`.
 *
 * Props:
 * - `closeHandler` (`() => void`): Closes the filter modal.
 * - `submitHandler` (`(values: z.infer<typeof FilterFormSchema>) => void`): Applies the selected filters.
 * - `resetHandler` (`() => void`): Resets all filters.
 * - `filterForm` (`UseFormReturn<FilterForm>`): React Hook Form instance for managing filter values.
 *
 * Hooks:
 * - `useGetDepartmentsQuery` for retrieving department data.
 *
 * UI Components:
 * - `Card`, `Form`, `Select`, `Button` for structured input handling.
 *
 * @returns {JSX.Element} The search filters modal.
 */

const SearchFilters = ({
  closeHandler,
  submitHandler,
  resetHandler,
  filterForm,
}: SearchFiltersProps) => {
  const handleApply = (values: z.infer<typeof FilterFormSchema>) => {
    submitHandler(values);
    closeHandler();
  };

  const { data, isLoading, error, refetch } = useGetDepartmentsQuery();

  return (
    <div className="fixed -top-8 inset-0 z-[50] bg-black/50 flex items-center justify-center">
      <Card className="w-[600px]">
        <CardHeader>
          <div className="relative">
            <X
              size={16}
              onClick={() => closeHandler()}
              className="absolute top-0 right-0 cursor-pointer hover:text-gray-400"
            />
          </div>
          <CardTitle className="font-medium pb-2">Filters</CardTitle>
          <CardDescription>Apply filters to course search.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...filterForm}>
            <form
              onSubmit={filterForm.handleSubmit(handleApply, (errors) =>
                console.log(errors),
              )}
              className="space-y-8"
            >
              <div className="flex flex-col gap-8 w-full flex-wrap items-center">
                <FormField
                  control={filterForm.control}
                  name="breadthRequirement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breadth Requirement</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={""}
                        >
                          <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a breadth requirement" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(BreadthRequirementEnum.Values).map(
                              (value) => (
                                <SelectItem key={value} value={value}>
                                  {convertBreadthRequirement(value)}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filterForm.control}
                  name="creditWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Weight</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(e) => field.onChange(Number(e))}
                          value={field.value?.toString()}
                          defaultValue={""}
                        >
                          <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a credit weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 credit</SelectItem>
                            <SelectItem value="0.5">0.5 credit</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filterForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={""}
                        >
                          <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                          <SelectContent>
                            {data &&
                              data.length > 0 &&
                              data.map((item: DepartmentModel) => (
                                <SelectItem
                                  key={item.code[0]}
                                  value={item.code[0]}
                                >
                                  {item.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filterForm.control}
                  name="yearLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Level</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(e) => field.onChange(Number(e))}
                          value={field.value?.toString()}
                          defaultValue={""}
                        >
                          <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a year level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Year 1</SelectItem>
                            <SelectItem value="2">Year 2</SelectItem>
                            <SelectItem value="3">Year 3</SelectItem>
                            <SelectItem value="4">Year 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-x-4">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      filterForm.reset();
                      resetHandler();
                    }}
                  >
                    Reset
                  </Button>
                  <Button type="submit">Apply</Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchFilters;
