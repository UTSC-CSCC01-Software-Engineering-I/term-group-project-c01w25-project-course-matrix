import { renderHook, act } from "@testing-library/react";
import { useDebounceValue } from "../src/utils/useDebounce";
import {
  jest,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";

describe("useDebounceValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should return the initial value immediately", () => {
    const initialValue = "initial";
    const { result } = renderHook(() => useDebounceValue(initialValue, 500));

    expect(result.current).toBe(initialValue);
  });

  test("should delay updating the value until after the specified interval", () => {
    const initialValue = "initial";
    const { result, rerender } = renderHook(
      ({ value, interval }) => useDebounceValue(value, interval),
      { initialProps: { value: initialValue, interval: 500 } },
    );

    expect(result.current).toBe(initialValue);

    // Change the value
    const newValue = "updated";
    rerender({ value: newValue, interval: 500 });

    // Value should not have changed yet
    expect(result.current).toBe(initialValue);

    // Fast-forward time by 499ms (just before the debounce interval)
    act(() => {
      jest.advanceTimersByTime(499);
    });

    // Value should still be the initial value
    expect(result.current).toBe(initialValue);

    // Fast-forward the remaining 1ms to reach the debounce interval
    act(() => {
      jest.advanceTimersByTime(1);
    });

    // Value should now be updated
    expect(result.current).toBe(newValue);
  });

  test("should reset the debounce timer when the value changes again", () => {
    const initialValue = "initial";
    const { result, rerender } = renderHook(
      ({ value, interval }) => useDebounceValue(value, interval),
      { initialProps: { value: initialValue, interval: 500 } },
    );

    // Change the value once
    rerender({ value: "intermediate", interval: 500 });

    // Fast-forward time by 250ms (halfway through debounce interval)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should still be initial
    expect(result.current).toBe(initialValue);

    // Change the value again
    rerender({ value: "final", interval: 500 });

    // Fast-forward another 250ms (would reach the first interval, but timer was reset)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should still be initial because timer was reset
    expect(result.current).toBe(initialValue);

    // Fast-forward to reach the new timer completion
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should now be the final value
    expect(result.current).toBe("final");
  });

  test("should respect the new interval when interval changes", () => {
    const initialValue = "initial";
    const { result, rerender } = renderHook(
      ({ value, interval }) => useDebounceValue(value, interval),
      { initialProps: { value: initialValue, interval: 500 } },
    );

    // Change value and interval
    rerender({ value: "updated", interval: 1000 });

    // Fast-forward by 500ms (the original interval)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should still be initial because new interval is 1000ms
    expect(result.current).toBe(initialValue);

    // Fast-forward by another 500ms to reach new 1000ms interval
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should now be updated
    expect(result.current).toBe("updated");
  });

  test("should work with different data types", () => {
    // Test with object
    const initialObject = { name: "John" };
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, interval }) => useDebounceValue(value, interval),
      { initialProps: { value: initialObject, interval: 200 } },
    );

    const newObject = { name: "Jane" };
    objectRerender({ value: newObject, interval: 200 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(objectResult.current).toEqual(newObject);

    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, interval }) => useDebounceValue(value, interval),
      { initialProps: { value: 1, interval: 200 } },
    );

    numberRerender({ value: 2, interval: 200 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(numberResult.current).toBe(2);
  });

  test("should clean up timeout on unmount", () => {
    const clearTimeoutSpy = jest.spyOn(window, "clearTimeout");
    const { unmount } = renderHook(() => useDebounceValue("test", 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
