import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  beforeEach,
  describe,
  vi,
  Mock,
  afterEach,
  it,
  expect,
  MockedFunction,
} from "vitest";
import TimetableBuilder from "../src/pages/TimetableBuilder/TimetableBuilder";
import { useForm, UseFormWatch } from "react-hook-form";
import { z } from "zod";
import React from "react";

vi.mock("react-hook-form", () => ({
  useForm: vi.fn(),
}));

vi.mock("@/api/coursesApiSlice", () => ({
  useGetCoursesQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("@/api/timetableApiSlice", () => ({
  useGetTimetablesQuery: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/api/eventsApiSlice", () => ({
  useGetEventsQuery: vi.fn(() => ({ data: null })),
}));

vi.mock("@/api/offeringsApiSlice", () => ({
  useGetOfferingsQuery: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/api/restrictionsApiSlice", () => ({
  useGetRestrictionsQuery: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/utils/useDebounce", () => ({
  useDebounceValue: (value: string) => value,
}));

describe("TimetableBuilder", () => {
  const mockSetValue = vi.fn();
  const mockHandleSubmit = vi.fn((fn) => fn);

  beforeEach(() => {
    (useForm as Mock).mockReturnValue({
      control: {},
      handleSubmit: mockHandleSubmit,
      setValue: mockSetValue,
      watch: vi.fn(() => {
        const result: { unsubscribe: () => void } & any[] = [];
        result.unsubscribe = () => {};
        return result;
      }) as unknown as UseFormWatch<any>,
      reset: vi.fn(),
      getValues: vi.fn(() => []),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the TimetableBuilder component", () => {
    render(
      <BrowserRouter>
        <TimetableBuilder />
      </BrowserRouter>,
    );

    expect(screen.getByText(/New Timetable/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Pick a few courses you'd like to take/i),
    ).toBeInTheDocument();
  });

  it("calls the reset function when the Reset button is clicked", () => {
    const mockReset = vi.fn();
    (useForm as MockedFunction<typeof useForm>).mockReturnValue({
      reset: mockReset,
      handleSubmit: mockHandleSubmit,
      setValue: mockSetValue,
      watch: vi.fn(() => {
        const result: unknown = [];
        result.unsubscribe = () => {};
        return result;
      }),
      getValues: vi.fn(() => []),
    });

    render(
      <BrowserRouter>
        <TimetableBuilder />
      </BrowserRouter>,
    );

    const resetButton = screen.getByText(/Reset/i);
    fireEvent.click(resetButton);

    expect(mockReset).toHaveBeenCalled();
  });

  it("opens the custom settings modal when the Add new button is clicked", () => {
    render(
      <BrowserRouter>
        <TimetableBuilder />
      </BrowserRouter>,
    );

    const addNewButton = screen.getByText(/\+ Add new/i);
    fireEvent.click(addNewButton);

    expect(screen.getByText(/Custom Settings/i)).toBeInTheDocument();
  });

  it("displays selected courses when courses are added", async () => {
    const mockWatch = vi.fn(() => [
      { id: 1, code: "CS101", name: "Introduction to Computer Science" },
    ]);
    (useForm as vi.Mock).mockReturnValue({
      watch: mockWatch,
      handleSubmit: mockHandleSubmit,
      setValue: mockSetValue,
      reset: vi.fn(),
      getValues: vi.fn(() => []),
    });

    render(
      <BrowserRouter>
        <TimetableBuilder />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Selected courses: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/CS101/i)).toBeInTheDocument();
  });

  it("removes a course when the remove button is clicked", async () => {
    const mockWatch = vi.fn(() => [
      { id: 1, code: "CS101", name: "Introduction to Computer Science" },
    ]);
    const mockSetValue = vi.fn();
    (useForm as vi.Mock).mockReturnValue({
      watch: mockWatch,
      handleSubmit: mockHandleSubmit,
      setValue: mockSetValue,
      reset: vi.fn(),
      getValues: vi.fn(() => [
        { id: 1, code: "CS101", name: "Introduction to Computer Science" },
      ]),
    });

    render(
      <BrowserRouter>
        <TimetableBuilder />
      </BrowserRouter>,
    );

    const removeButton = screen.getByRole("button", { name: /Remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith("courses", []);
    });
  });

  it("submits the form when the Generate button is clicked", () => {
    const mockSubmit = vi.fn();
    (useForm as vi.Mock).mockReturnValue({
      handleSubmit: vi.fn((fn) => fn),
      setValue: mockSetValue,
      watch: vi.fn(() => []),
      reset: vi.fn(),
      getValues: vi.fn(() => []),
    });

    render(
      <BrowserRouter>
        <TimetableBuilder />
      </BrowserRouter>,
    );

    const generateButton = screen.getByText(/Generate/i);
    fireEvent.click(generateButton);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
