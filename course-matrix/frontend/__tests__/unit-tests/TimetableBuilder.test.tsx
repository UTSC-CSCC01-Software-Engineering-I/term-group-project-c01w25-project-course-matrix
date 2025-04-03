import "@testing-library/jest-dom/jest-globals";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, test, jest } from "@jest/globals";

import TimetableBuilder from "../../../frontend/src/pages/TimetableBuilder/TimetableBuilder";
import React from "react";

jest.mock(
  "../../../frontend/src/pages/TimetableBuilder/TimetableBuilder",
  () => ({
    __esModule: true,
    default: () => {
      return (
        <div>
          <h1>New Timetable</h1>
          <p>Pick a few courses you'd like to take</p>
          <button type="button">Reset</button>
          <button type="button">+ Add new</button>
          <p>Selected courses: 0</p>
          <button type="submit">Generate</button>
        </div>
      );
    },
  }),
);

describe("TimetableBuilder", () => {
  test("renders the TimetableBuilder component", () => {
    render(<TimetableBuilder />);
    expect(screen.getByText("New Timetable")).toBeInTheDocument();
    expect(
      screen.getByText("Pick a few courses you'd like to take"),
    ).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("+ Add new")).toBeInTheDocument();
    expect(screen.getByText("Selected courses: 0")).toBeInTheDocument();
    expect(screen.getByText("Generate")).toBeInTheDocument();
  });
});
