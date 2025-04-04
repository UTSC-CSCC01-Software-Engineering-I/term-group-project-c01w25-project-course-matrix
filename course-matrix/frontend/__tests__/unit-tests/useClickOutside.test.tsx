import { render, act } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useClickOutside } from "../../src/utils/useClickOutside"; // adjust the import path as needed
import React, { useRef } from "react";
import {
  jest,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";

// Test component that uses the hook
const TestComponent = ({
  isActive,
  onClickOutside,
  useExcludeRef = false,
}: {
  isActive: boolean;
  onClickOutside: () => void;
  useExcludeRef?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const excludeRef = useRef<HTMLButtonElement>(null);

  useClickOutside(
    ref,
    onClickOutside,
    isActive,
    useExcludeRef ? excludeRef : undefined,
  );

  return (
    <div>
      <div data-testid="inside-element" ref={ref}>
        Inside Element
      </div>
      {useExcludeRef && (
        <button data-testid="excluded-element" ref={excludeRef}>
          Excluded Element
        </button>
      )}
      <div data-testid="outside-element">Outside Element</div>
    </div>
  );
};

describe("useClickOutside", () => {
  // Mock callback function
  const mockOnClickOutside = jest.fn();

  beforeEach(() => {
    // Reset mocks
    mockOnClickOutside.mockReset();

    // Spy on addEventListener and removeEventListener
    jest.spyOn(document, "addEventListener");
    jest.spyOn(document, "removeEventListener");
  });

  afterEach(() => {
    // Restore spies
    jest.restoreAllMocks();
  });

  test("should add event listener when isActive is true", () => {
    render(
      <TestComponent isActive={true} onClickOutside={mockOnClickOutside} />,
    );

    expect(document.addEventListener).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );
  });

  test("should not add event listener when isActive is false", () => {
    render(
      <TestComponent isActive={false} onClickOutside={mockOnClickOutside} />,
    );

    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  test("should remove event listener when isActive changes from true to false", () => {
    const { rerender } = render(
      <TestComponent isActive={true} onClickOutside={mockOnClickOutside} />,
    );

    rerender(
      <TestComponent isActive={false} onClickOutside={mockOnClickOutside} />,
    );

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );

    rerender(
      <TestComponent isActive={false} onClickOutside={mockOnClickOutside} />,
    );

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );
  });

  test("should call onClickOutside when clicking outside the ref element", () => {
    const { getByTestId } = render(
      <TestComponent isActive={true} onClickOutside={mockOnClickOutside} />,
    );

    // Simulate clicking outside
    fireEvent.mouseDown(getByTestId("outside-element"));

    expect(mockOnClickOutside).toHaveBeenCalledTimes(1);
  });

  test("should not call onClickOutside when clicking inside the ref element", () => {
    const { getByTestId } = render(
      <TestComponent isActive={true} onClickOutside={mockOnClickOutside} />,
    );

    // Simulate clicking inside
    fireEvent.mouseDown(getByTestId("inside-element"));

    expect(mockOnClickOutside).not.toHaveBeenCalled();
  });

  test("should not call onClickOutside when clicking inside the excluded element", () => {
    const { getByTestId } = render(
      <TestComponent
        isActive={true}
        onClickOutside={mockOnClickOutside}
        useExcludeRef={true}
      />,
    );

    // Simulate clicking on the excluded element
    fireEvent.mouseDown(getByTestId("excluded-element"));

    expect(mockOnClickOutside).not.toHaveBeenCalled();
  });

  test("should clean up event listener when unmounting", () => {
    const { unmount } = render(
      <TestComponent isActive={true} onClickOutside={mockOnClickOutside} />,
    );

    unmount();

    expect(document.removeEventListener).toHaveBeenCalled();
  });

  test("should re-attach event listener when dependencies change", () => {
    const newMockCallback = jest.fn();
    const { rerender } = render(
      <TestComponent isActive={true} onClickOutside={mockOnClickOutside} />,
    );

    // First, verify initial setup
    expect(document.addEventListener).toHaveBeenCalledTimes(1);

    // Reset the spy counts to make verification clearer
    jest.clearAllMocks();

    // Change callback
    rerender(
      <TestComponent isActive={true} onClickOutside={newMockCallback} />,
    );

    // Should remove old listener and add new one
    expect(document.removeEventListener).toHaveBeenCalledTimes(1);
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
  });
});
