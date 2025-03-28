import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useContext, useState } from "react";
import { FormContext } from "./TimetableBuilder";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  baseRestrictionForm,
  daysOfWeek,
  RestrictionSchema,
} from "@/models/timetable-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePickerHr } from "@/components/time-picker-hr";
import { Input } from "@/components/ui/input";

interface CreateCustomSettingProps {
  closeHandler: () => void;
  submitHandler: (values: z.infer<typeof RestrictionSchema>) => void;
}

/**
 * CreateCustomSetting Component
 *
 * Allows users to define custom scheduling restrictions for their timetable. Users can restrict courses
 * based on specific times, days, or enforce a minimum number of days off per week.
 *
 * Features:
 * - **Restriction Types**:
 *   - Restrict times before/after/between specific hours.
 *   - Restrict entire days from scheduling.
 *   - Enforce a minimum number of days off per week.
 * - **Form Handling**:
 *   - Uses `react-hook-form` with `zodResolver` for validation.
 *   - Dynamically updates input fields based on selected restriction type.
 * - **Time Selection**:
 *   - Uses `TimePickerHr` to select start and end times.
 * - **Day Selection**:
 *   - Uses checkboxes for selecting restricted days.
 * - **Submission Handling**:
 *   - Calls `submitHandler` with validated restriction data.
 *   - Closes modal on successful submission.
 *
 * Props:
 * - `closeHandler` (`() => void`): Function to close the restriction modal.
 * - `submitHandler` (`(values: z.infer<typeof RestrictionSchema>) => void`): Callback to apply the restriction.
 *
 * Hooks:
 * - `useForm` for form state management.
 * - `useState` for managing UI behavior.
 *
 * UI Components:
 * - `Card`, `Form`, `Input`, `Checkbox`, `Select`, `Button` for structured form inputs.
 * - `TimePickerHr` for time selection.
 *
 * @returns {JSX.Element} The restriction creation form.
 */

const CreateCustomSetting = ({
  closeHandler,
  submitHandler,
}: CreateCustomSettingProps) => {
  const restrictionForm = useForm<z.infer<typeof RestrictionSchema>>({
    resolver: zodResolver(RestrictionSchema),
    defaultValues: baseRestrictionForm,
  });

  const restrictionType = restrictionForm.watch("type");

  const createRestriction = (values: z.infer<typeof RestrictionSchema>) => {
    console.log(values);
    submitHandler(values);
    closeHandler();
  };

  const form = useContext(FormContext);

  const isDaysOffRestrictionApplied = () => {
    const val = form
      ?.getValues("restrictions")
      .some((r) => r.type === "Days Off");
    // console.log(val);
    return val;
  };

  const isMaxGapRestrictionApplied = () => {
    const val = form
      ?.getValues("restrictions")
      .some((r) => r.type === "Max Gap");
    // console.log(val);
    return val;
  };

  const getRestrictionType = (value: string) => {
    if (
      value === "Restrict Before" ||
      value === "Restrict After" ||
      value === "Restrict Between"
    ) {
      return "time";
    } else if (value === "Restrict Day") {
      return "day";
    } else if (value === "Days Off") {
      return "days off";
    } else if (value === "Max Gap") {
      return "hours";
    }
  };

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
          <CardTitle className="font-medium pb-2">
            Create New Restriction
          </CardTitle>
          <CardDescription>
            Prevent courses from being scheduled for certain times and days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...restrictionForm}>
            <form
              onSubmit={restrictionForm.handleSubmit(
                createRestriction,
                (errors) => console.log(errors),
              )}
              className="space-y-8"
            >
              <div className="flex gap-8 w-full flex-wrap">
                <FormField
                  control={restrictionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restriction Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={""}
                        >
                          <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Restrict Before">
                              Restrict Times Before XX:XX
                            </SelectItem>
                            <SelectItem value="Restrict After">
                              Restrict Times After XX:XX
                            </SelectItem>
                            <SelectItem value="Restrict Between">
                              Restrict Times Between XX:XX-YY:YY
                            </SelectItem>
                            <SelectItem value="Restrict Day">
                              Restrict Entire Day
                            </SelectItem>
                            <SelectItem
                              value="Days Off"
                              disabled={isDaysOffRestrictionApplied()}
                            >
                              Enforce Minimum Days Off Per Week
                            </SelectItem>
                            <SelectItem
                              value="Max Gap"
                              disabled={isMaxGapRestrictionApplied()}
                            >
                              Max Gap Between Offerings
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {restrictionType &&
                (getRestrictionType(restrictionType) === "day" ||
                  getRestrictionType(restrictionType) === "time") ? (
                  <>
                    <FormField
                      control={restrictionForm.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Days</FormLabel>
                          <div className="flex flex-wrap gap-4">
                            {daysOfWeek.map((item) => (
                              <FormField
                                key={item.id}
                                control={restrictionForm.control}
                                name="days"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            item.id,
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...(field?.value || []),
                                                  item.id,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) =>
                                                      value !== item.id,
                                                  ),
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                            <FormField
                                control={restrictionForm.control}
                                name="days"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.length === daysOfWeek.length}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange(daysOfWeek.map(item => item.id))
                                              : field.onChange([]);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        All Days
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {restrictionType &&
                      (restrictionType === "Restrict After" ||
                        restrictionType === "Restrict Between") && (
                        <FormField
                          control={restrictionForm.control}
                          name="startTime"
                          defaultValue={
                            new Date(new Date().setHours(0, 0, 0, 0))
                          } // 12 AM
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From</FormLabel>
                              <FormControl>
                                <div className="p-3 border-t border-border">
                                  <TimePickerHr
                                    setDate={field.onChange}
                                    date={field.value}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                    {restrictionType &&
                      (restrictionType === "Restrict Before" ||
                        restrictionType === "Restrict Between") && (
                        <FormField
                          control={restrictionForm.control}
                          name="endTime"
                          defaultValue={
                            new Date(new Date().setHours(0, 0, 0, 0))
                          } // 12 AM
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>To</FormLabel>
                              <FormControl>
                                <div className="p-3 border-t border-border">
                                  <TimePickerHr
                                    setDate={field.onChange}
                                    date={field.value}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                  </>
                ) : restrictionType &&
                  getRestrictionType(restrictionType) === "days off" ? (
                  <>
                    <FormField
                      control={restrictionForm.control}
                      name="numDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum no. days off per week</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  restrictionType &&
                  getRestrictionType(restrictionType) === "hours" && (
                    <>
                      <FormField
                        control={restrictionForm.control}
                        name="maxGap"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Max gap allowed between
                              lectures/tutorials/practicals (hours)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(e.target.valueAsNumber)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )
                )}
              </div>

              <Button type="submit">Create</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
};

export default CreateCustomSetting;
