import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockBack = vi.fn();

vi.mock("@refinedev/core", () => ({
  useBack: () => mockBack,
  useBreadcrumb: () => ({ breadcrumbs: [] }),
  useLink: () =>
    ({ children, to }: { children: React.ReactNode; to: string }) =>
      React.createElement("a", { href: to }, children),
  useResourceParams: () => ({
    resources: [],
    resource: undefined,
    identifier: undefined,
  }),
  matchResourceFromRoute: () => ({
    matchedRoute: "/",
    resource: undefined,
  }),
  useUserFriendlyName: () => (name: string) => name,
}));

// Mock UploadWidget — simplified control button (simulates selecting a file)
vi.mock("@/components/upload-widget", () => ({
  default: ({
    value,
    onChange: _onChange,
    disabled,
  }: {
    value: { url: string; publicId: string } | null;
    onChange: (v: any) => void;
    disabled?: boolean;
  }) =>
    value
      ? React.createElement("img", {
          src: value.url,
          alt: "Uploaded file",
          "data-testid": "upload-preview",
        })
      : React.createElement(
          "button",
          {
            type: "button",
            "data-testid": "upload-widget",
            disabled,
          },
          "Click to upload photo"
        ),
}));

import Create from "../create";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderCreate = () => render(<Create />);

beforeEach(() => {
  mockBack.mockReset();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("ClassesCreate page", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      renderCreate();
    });

    it("displays the page heading 'Create Class'", () => {
      renderCreate();
      expect(screen.getByRole("heading", { level: 1, name: /create class/i })).toBeTruthy();
    });

    it("renders the Go Back button", () => {
      renderCreate();
      expect(screen.getByRole("button", { name: /go back/i })).toBeTruthy();
    });

    it("renders the submit button with 'Create Class' label", () => {
      renderCreate();
      expect(
        screen.getByRole("button", { name: /^create class$/i })
      ).toBeTruthy();
    });

    it("renders the Banner Image label", () => {
      renderCreate();
      expect(screen.getByText(/banner image/i)).toBeTruthy();
    });

    it("renders the Class Name input field", () => {
      renderCreate();
      expect(
        screen.getByPlaceholderText(/introduction to biology/i)
      ).toBeTruthy();
    });

    it("renders the Description textarea", () => {
      renderCreate();
      expect(
        screen.getByPlaceholderText(/brief description about the class/i)
      ).toBeTruthy();
    });

    it("renders the Capacity input with placeholder '30'", () => {
      renderCreate();
      expect(screen.getByPlaceholderText("30")).toBeTruthy();
    });

    it("renders the UploadWidget component", () => {
      renderCreate();
      expect(screen.getByTestId("upload-widget")).toBeTruthy();
    });

    it("renders informational copy about providing class information", () => {
      renderCreate();
      expect(
        screen.getByText(/provide the required information below/i)
      ).toBeTruthy();
    });

    it("renders the 'fill out the form' card title", () => {
      renderCreate();
      expect(screen.getByText(/fill out the form/i)).toBeTruthy();
    });
  });

  describe("static select labels", () => {
    it("renders a Subject label in the form", () => {
      renderCreate();
      expect(screen.getByText(/^subject/i)).toBeTruthy();
    });

    it("renders a Teacher label in the form", () => {
      renderCreate();
      expect(screen.getByText(/^teacher/i)).toBeTruthy();
    });

    it("renders a Status label in the form", () => {
      renderCreate();
      expect(screen.getByText(/^status/i)).toBeTruthy();
    });

    it("renders a Capacity label in the form", () => {
      renderCreate();
      expect(screen.getByText(/^capacity$/i)).toBeTruthy();
    });

    it("renders a Description label in the form", () => {
      renderCreate();
      expect(screen.getByText(/^description$/i)).toBeTruthy();
    });
  });

  describe("form validation", () => {
    it("shows banner required error on empty submit (field uses required_error)", async () => {
      renderCreate();
      const submitBtn = screen.getByRole("button", {
        name: /^create class$/i,
      });
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/class banner is required/i)).toBeTruthy();
      });
    });

    it("shows name min-length error when a single character is typed", async () => {
      renderCreate();
      const nameInput = screen.getByPlaceholderText(/introduction to biology/i);
      await userEvent.type(nameInput, "A");

      const submitBtn = screen.getByRole("button", {
        name: /^create class$/i,
      });
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/class name must be at least 2 characters/i)
        ).toBeTruthy();
      });
    });

    it("shows description min-length error when short text is typed", async () => {
      renderCreate();
      const desc = screen.getByPlaceholderText(
        /brief description about the class/i
      );
      await userEvent.type(desc, "Hi");

      const submitBtn = screen.getByRole("button", {
        name: /^create class$/i,
      });
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/description must be at least 5 characters/i)
        ).toBeTruthy();
      });
    });

    it("clears name error after a valid name is entered", async () => {
      renderCreate();
      const nameInput = screen.getByPlaceholderText(/introduction to biology/i);
      // Type a too-short name then submit to trigger error
      await userEvent.type(nameInput, "A");
      const submitBtn = screen.getByRole("button", {
        name: /^create class$/i,
      });
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/class name must be at least 2 characters/i)
        ).toBeTruthy();
      });

      // Fix the name - error should clear
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "Advanced Physics");

      await waitFor(() => {
        expect(
          screen.queryByText(/class name must be at least 2 characters/i)
        ).toBeNull();
      });
    });

    it("shows error for name that is too long (>50 chars)", async () => {
      renderCreate();
      const nameInput = screen.getByPlaceholderText(/introduction to biology/i);
      await userEvent.type(nameInput, "A".repeat(51));

      const submitBtn = screen.getByRole("button", {
        name: /^create class$/i,
      });
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/class name must be at most 50 characters/i)
        ).toBeTruthy();
      });
    });
  });

  describe("banner image area", () => {
    it("shows the upload widget (not a preview) initially", () => {
      renderCreate();
      expect(screen.getByTestId("upload-widget")).toBeTruthy();
      expect(screen.queryByTestId("upload-preview")).toBeNull();
    });
  });

  describe("Go Back button", () => {
    it("calls the back function when clicked", async () => {
      renderCreate();
      const backButton = screen.getByRole("button", { name: /go back/i });
      await userEvent.click(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("capacity field", () => {
    it("accepts numeric input in the capacity field", async () => {
      renderCreate();
      const capacityInput = screen.getByPlaceholderText("30");
      await userEvent.clear(capacityInput);
      await userEvent.type(capacityInput, "25");
      expect((capacityInput as HTMLInputElement).value).toBe("25");
    });
  });
});