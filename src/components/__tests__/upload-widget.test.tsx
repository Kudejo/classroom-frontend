import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock constants before component import
vi.mock("@/constants", () => ({
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_UPLOAD_PRESET: "test-preset",
}));

import UploadWidget from "../upload-widget";

// Helper: build a mock Cloudinary widget
const makeMockWidget = () => ({
  open: vi.fn(),
});

// Helper: install a mock window.cloudinary
const installCloudinary = (
  widget = makeMockWidget()
): ReturnType<typeof makeMockWidget> => {
  const createUploadWidget = vi.fn(() => widget);
  (window as any).cloudinary = { createUploadWidget };
  return widget;
};

const removeCloudinary = () => {
  delete (window as any).cloudinary;
};

describe("UploadWidget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    removeCloudinary();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe("rendering", () => {
    it("renders upload dropzone when value is null", () => {
      installCloudinary();
      const { container } = render(
        <UploadWidget value={null} onChange={vi.fn()} />
      );
      act(() => { vi.runAllTimers(); });
      expect(container.querySelector(".upload-dropzone")).toBeTruthy();
    });

    it("renders dropzone text prompts", () => {
      installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });
      expect(screen.getByText("Click to upload photo")).toBeTruthy();
      expect(screen.getByText("PNG, JPG up to 5mb")).toBeTruthy();
    });

    it("renders an image preview when a value is provided", () => {
      installCloudinary();
      const value = { url: "https://example.com/img.png", publicId: "img123" };
      render(<UploadWidget value={value} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });
      const img = screen.getByRole("img", { name: /uploaded file/i });
      expect(img).toBeTruthy();
      expect((img as HTMLImageElement).src).toBe(
        "https://example.com/img.png"
      );
    });

    it("does NOT render dropzone when a preview value is set", () => {
      installCloudinary();
      const value = { url: "https://example.com/img.png", publicId: "img123" };
      const { container } = render(
        <UploadWidget value={value} onChange={vi.fn()} />
      );
      act(() => { vi.runAllTimers(); });
      expect(container.querySelector(".upload-dropzone")).toBeNull();
    });

    it("dropzone has role='button' and tabIndex 0 for keyboard access", () => {
      installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });
      const dropzone = screen.getByRole("button");
      expect(dropzone).toBeTruthy();
      expect(dropzone.tabIndex).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Widget initialization
  // -------------------------------------------------------------------------
  describe("widget initialization", () => {
    it("creates the cloudinary widget when window.cloudinary is available immediately", () => {
      installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });
      expect((window as any).cloudinary.createUploadWidget).toHaveBeenCalledTimes(1);
    });

    it("passes cloudName and uploadPreset to createUploadWidget", () => {
      const widget = installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });
      const call = (window as any).cloudinary.createUploadWidget.mock.calls[0][0];
      expect(call.cloudName).toBe("test-cloud");
      expect(call.uploadPreset).toBe("test-preset");
    });

    it("polls with setInterval when window.cloudinary is not yet available", () => {
      const setIntervalSpy = vi.spyOn(window, "setInterval");
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      // cloudinary not installed yet → interval should be scheduled
      expect(setIntervalSpy).toHaveBeenCalled();
      setIntervalSpy.mockRestore();
    });

    it("initializes widget once cloudinary becomes available during polling", () => {
      render(<UploadWidget value={null} onChange={vi.fn()} />);

      // Cloudinary not yet available; advance one interval tick
      installCloudinary();
      act(() => { vi.advanceTimersByTime(500); });

      expect((window as any).cloudinary.createUploadWidget).toHaveBeenCalledTimes(1);
    });

    it("does not initialize widget twice if already created", () => {
      const widget = installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });
      // createUploadWidget should still be 1 even after multiple timer ticks
      expect((window as any).cloudinary.createUploadWidget).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------
  describe("interactions", () => {
    it("opens the cloudinary widget on dropzone click", () => {
      const widget = installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });

      const dropzone = screen.getByRole("button");
      fireEvent.click(dropzone);

      expect(widget.open).toHaveBeenCalledTimes(1);
    });

    it("opens the widget on Enter key press", () => {
      const widget = installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });

      const dropzone = screen.getByRole("button");
      fireEvent.keyDown(dropzone, { key: "Enter" });

      expect(widget.open).toHaveBeenCalledTimes(1);
    });

    it("does NOT open widget when disabled is true", () => {
      const widget = installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} disabled={true} />);
      act(() => { vi.runAllTimers(); });

      const dropzone = screen.getByRole("button");
      fireEvent.click(dropzone);

      expect(widget.open).not.toHaveBeenCalled();
    });

    it("does NOT open widget on non-Enter key press", () => {
      const widget = installCloudinary();
      render(<UploadWidget value={null} onChange={vi.fn()} />);
      act(() => { vi.runAllTimers(); });

      const dropzone = screen.getByRole("button");
      fireEvent.keyDown(dropzone, { key: "Space" });

      expect(widget.open).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Upload callback
  // -------------------------------------------------------------------------
  describe("upload callback", () => {
    it("calls onChange and updates preview on successful upload", () => {
      const onChange = vi.fn();
      let capturedCallback: ((error: unknown, result: any) => void) | null =
        null;
      const mockWidget = { open: vi.fn() };

      (window as any).cloudinary = {
        createUploadWidget: vi.fn((_opts, cb) => {
          capturedCallback = cb;
          return mockWidget;
        }),
      };

      render(<UploadWidget value={null} onChange={onChange} />);
      act(() => { vi.runAllTimers(); });

      expect(capturedCallback).not.toBeNull();

      // Simulate successful upload
      act(() => {
        capturedCallback!(null, {
          event: "success",
          info: {
            secure_url: "https://res.cloudinary.com/demo/image/upload/v1/test.jpg",
            public_id: "test_pub_id",
          },
        });
      });

      expect(onChange).toHaveBeenCalledWith({
        url: "https://res.cloudinary.com/demo/image/upload/v1/test.jpg",
        publicId: "test_pub_id",
      });

      // Preview image should now appear
      expect(screen.getByRole("img", { name: /uploaded file/i })).toBeTruthy();
    });

    it("does NOT call onChange when upload result event is not 'success'", () => {
      const onChange = vi.fn();
      let capturedCallback: ((error: unknown, result: any) => void) | null =
        null;

      (window as any).cloudinary = {
        createUploadWidget: vi.fn((_opts, cb) => {
          capturedCallback = cb;
          return { open: vi.fn() };
        }),
      };

      render(<UploadWidget value={null} onChange={onChange} />);
      act(() => { vi.runAllTimers(); });

      act(() => {
        capturedCallback!(null, { event: "queued", info: {} });
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("does NOT call onChange when upload result has an error", () => {
      const onChange = vi.fn();
      let capturedCallback: ((error: unknown, result: any) => void) | null =
        null;

      (window as any).cloudinary = {
        createUploadWidget: vi.fn((_opts, cb) => {
          capturedCallback = cb;
          return { open: vi.fn() };
        }),
      };

      render(<UploadWidget value={null} onChange={onChange} />);
      act(() => { vi.runAllTimers(); });

      act(() => {
        capturedCallback!(new Error("upload failed"), {
          event: "success",
          info: { secure_url: "url", public_id: "id" },
        });
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Value prop syncing
  // -------------------------------------------------------------------------
  describe("value prop syncing", () => {
    it("updates preview when value prop changes from null to a value", () => {
      const widget = installCloudinary();
      const { rerender } = render(
        <UploadWidget value={null} onChange={vi.fn()} />
      );
      act(() => { vi.runAllTimers(); });

      expect(screen.queryByRole("img")).toBeNull();

      rerender(
        <UploadWidget
          value={{ url: "https://example.com/new.jpg", publicId: "new123" }}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByRole("img")).toBeTruthy();
    });

    it("clears preview when value prop changes to null", () => {
      const widget = installCloudinary();
      const { rerender } = render(
        <UploadWidget
          value={{ url: "https://example.com/img.png", publicId: "img123" }}
          onChange={vi.fn()}
        />
      );
      act(() => { vi.runAllTimers(); });

      expect(screen.getByRole("img")).toBeTruthy();

      rerender(<UploadWidget value={null} onChange={vi.fn()} />);

      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByRole("button")).toBeTruthy();
    });
  });
});