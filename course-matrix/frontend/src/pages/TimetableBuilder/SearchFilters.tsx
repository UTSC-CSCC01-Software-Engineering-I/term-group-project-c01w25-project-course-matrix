import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { BreadthRequirementEnum, FilterForm, FilterFormSchema } from "@/models/filter-form";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertBreadthRequirement } from "@/utils/convert-breadth-requirement";
import { SemesterEnum } from "@/models/timetable-form";

interface SearchFiltersProps {
  closeHandler: () => void;
  submitHandler: (values: z.infer<typeof FilterFormSchema>) => void;
  resetHandler: () => void;
  filterForm: UseFormReturn<FilterForm, any, undefined>;
}

const SearchFilters = ({
  closeHandler,
  submitHandler,
  resetHandler,
  filterForm,
}: SearchFiltersProps) => {

  const handleApply = (values: z.infer<typeof FilterFormSchema>) => {
    submitHandler(values)
    closeHandler()
  }

  return (
    <div className="fixed -top-8 inset-0 z-[50] bg-black/50 flex items-center justify-center">
      <Card className="w-[600px]">
        <CardHeader>
          <div className="relative">
            <X size={16} onClick={() => closeHandler()} className="absolute top-0 right-0 cursor-pointer hover:text-gray-400"/>
          </div>
          <CardTitle className="font-medium pb-2">Filters</CardTitle>
          <CardDescription>Apply filters to course search.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...filterForm}>
            <form onSubmit={filterForm.handleSubmit(handleApply, (errors) => console.log(errors) )} className="space-y-8">
              <div className="flex flex-col gap-8 w-full flex-wrap items-center">
                <FormField
                  control={filterForm.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={""}>
                          <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(SemesterEnum.Values).map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
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
                  name="breadthRequirement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breadth Requirement</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={""}>
                          <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a breadth requirement" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(BreadthRequirementEnum.Values).map((value) => (
                              <SelectItem key={value} value={value}>
                                {convertBreadthRequirement(value)}
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
                  name="creditWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Weight</FormLabel>
                      <FormControl>
                        <Select onValueChange={(e) => field.onChange(Number(e))} value={field.value?.toString()} defaultValue={""}>
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
                <div className="space-x-4">
                  <Button variant="secondary" type="button" onClick={() => {
                    filterForm.reset()
                    resetHandler()
                  }}>
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

  )
}

export default SearchFilters