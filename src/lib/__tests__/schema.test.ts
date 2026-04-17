import { describe, it, expect } from "vitest";
import {
  classSchema,
  facultySchema,
  subjectSchema,
  enrollmentSchema,
} from "../schema";

// ---------------------------------------------------------------------------
// classSchema
// ---------------------------------------------------------------------------
describe("classSchema", () => {
  const validClass = {
    name: "Introduction to Biology",
    description: "A broad overview of biological sciences",
    subjectId: 1,
    teacherId: "teacher-123",
    capacity: 30,
    status: "active" as const,
    bannerUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    bannerCldPubId: "uploads/sample",
  };

  it("accepts a fully valid class object", () => {
    expect(classSchema.safeParse(validClass).success).toBe(true);
  });

  it("accepts optional fields when omitted", () => {
    const result = classSchema.safeParse(validClass);
    expect(result.success).toBe(true);
  });

  it("accepts an object with optional inviteCode and schedules", () => {
    const withOptionals = {
      ...validClass,
      inviteCode: "ABC123",
      schedules: [{ day: "Monday", startTime: "09:00", endTime: "10:00" }],
    };
    expect(classSchema.safeParse(withOptionals).success).toBe(true);
  });

  // --- name ---
  it("rejects name shorter than 2 characters", () => {
    const result = classSchema.safeParse({ ...validClass, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least 2 characters/i
      );
    }
  });

  it("rejects name longer than 50 characters", () => {
    const result = classSchema.safeParse({
      ...validClass,
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at most 50 characters/i
      );
    }
  });

  it("accepts name at boundary: exactly 2 characters", () => {
    expect(
      classSchema.safeParse({ ...validClass, name: "AB" }).success
    ).toBe(true);
  });

  it("accepts name at boundary: exactly 50 characters", () => {
    expect(
      classSchema.safeParse({ ...validClass, name: "A".repeat(50) }).success
    ).toBe(true);
  });

  // --- description ---
  it("rejects description shorter than 5 characters", () => {
    const result = classSchema.safeParse({ ...validClass, description: "Hi" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least 5 characters/i
      );
    }
  });

  // --- subjectId ---
  it("coerces subjectId from string to number", () => {
    const result = classSchema.safeParse({ ...validClass, subjectId: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subjectId).toBe(2);
    }
  });

  it("rejects subjectId of 0 (minimum is 1)", () => {
    const result = classSchema.safeParse({ ...validClass, subjectId: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/subject is required/i);
    }
  });

  it("rejects non-numeric subjectId string", () => {
    const result = classSchema.safeParse({
      ...validClass,
      subjectId: "not-a-number",
    });
    expect(result.success).toBe(false);
  });

  // --- teacherId ---
  it("rejects empty teacherId", () => {
    const result = classSchema.safeParse({ ...validClass, teacherId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/teacher is required/i);
    }
  });

  // --- capacity ---
  it("coerces capacity from string to number", () => {
    const result = classSchema.safeParse({ ...validClass, capacity: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(25);
    }
  });

  it("rejects capacity of 0", () => {
    const result = classSchema.safeParse({ ...validClass, capacity: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 1/i);
    }
  });

  // --- status ---
  it("accepts status 'active'", () => {
    expect(
      classSchema.safeParse({ ...validClass, status: "active" }).success
    ).toBe(true);
  });

  it("accepts status 'inactive'", () => {
    expect(
      classSchema.safeParse({ ...validClass, status: "inactive" }).success
    ).toBe(true);
  });

  it("rejects an invalid status value", () => {
    const result = classSchema.safeParse({
      ...validClass,
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  // --- bannerUrl ---
  it("rejects empty bannerUrl", () => {
    const result = classSchema.safeParse({ ...validClass, bannerUrl: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/class banner is required/i);
    }
  });

  // --- bannerCldPubId ---
  it("rejects empty bannerCldPubId", () => {
    const result = classSchema.safeParse({
      ...validClass,
      bannerCldPubId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /banner reference is required/i
      );
    }
  });

  // --- schedules ---
  it("rejects a schedule missing the day field", () => {
    const result = classSchema.safeParse({
      ...validClass,
      schedules: [{ day: "", startTime: "09:00", endTime: "10:00" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/day is required/i);
    }
  });

  it("rejects a schedule with empty startTime", () => {
    const result = classSchema.safeParse({
      ...validClass,
      schedules: [{ day: "Monday", startTime: "", endTime: "10:00" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /start time is required/i
      );
    }
  });

  it("rejects a schedule with empty endTime", () => {
    const result = classSchema.safeParse({
      ...validClass,
      schedules: [{ day: "Monday", startTime: "09:00", endTime: "" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/end time is required/i);
    }
  });

  it("accepts an empty schedules array", () => {
    const result = classSchema.safeParse({
      ...validClass,
      schedules: [],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// facultySchema
// ---------------------------------------------------------------------------
describe("facultySchema", () => {
  const validFaculty = {
    name: "Jane Doe",
    email: "jane@example.com",
    role: "teacher" as const,
    department: "Mathematics",
  };

  it("accepts a valid faculty object", () => {
    expect(facultySchema.safeParse(validFaculty).success).toBe(true);
  });

  it("accepts optional image fields when absent", () => {
    const result = facultySchema.safeParse(validFaculty);
    expect(result.success).toBe(true);
  });

  it("accepts optional image fields when provided", () => {
    expect(
      facultySchema.safeParse({
        ...validFaculty,
        image: "https://example.com/img.png",
        imageCldPubId: "uploads/img",
      }).success
    ).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = facultySchema.safeParse({ ...validFaculty, name: "J" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least 2 characters/i
      );
    }
  });

  it("rejects an invalid email address", () => {
    const result = facultySchema.safeParse({
      ...validFaculty,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/invalid email/i);
    }
  });

  it("rejects an invalid role", () => {
    const result = facultySchema.safeParse({
      ...validFaculty,
      role: "principal",
    });
    expect(result.success).toBe(false);
  });

  it("accepts role 'admin'", () => {
    expect(
      facultySchema.safeParse({ ...validFaculty, role: "admin" }).success
    ).toBe(true);
  });

  it("accepts role 'student'", () => {
    expect(
      facultySchema.safeParse({ ...validFaculty, role: "student" }).success
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// subjectSchema
// ---------------------------------------------------------------------------
describe("subjectSchema", () => {
  const validSubject = {
    name: "Biology",
    code: "BIO10",
    description: "Intro to Biology",
    department: "Science",
  };

  it("accepts a valid subject object", () => {
    expect(subjectSchema.safeParse(validSubject).success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = subjectSchema.safeParse({ ...validSubject, name: "AB" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least 3 characters/i
      );
    }
  });

  it("accepts name at boundary: exactly 3 characters", () => {
    expect(
      subjectSchema.safeParse({ ...validSubject, name: "Art" }).success
    ).toBe(true);
  });

  it("rejects code shorter than 5 characters", () => {
    const result = subjectSchema.safeParse({
      ...validSubject,
      code: "BIO",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least 5 characters/i
      );
    }
  });

  it("accepts code at boundary: exactly 5 characters", () => {
    expect(
      subjectSchema.safeParse({ ...validSubject, code: "BIO10" }).success
    ).toBe(true);
  });

  it("rejects description shorter than 5 characters", () => {
    const result = subjectSchema.safeParse({
      ...validSubject,
      description: "Bio",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least 5 characters/i
      );
    }
  });

  it("rejects department shorter than 2 characters", () => {
    const result = subjectSchema.safeParse({
      ...validSubject,
      department: "S",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /at least 2 characters/i
      );
    }
  });
});

// ---------------------------------------------------------------------------
// enrollmentSchema
// ---------------------------------------------------------------------------
describe("enrollmentSchema", () => {
  const validEnrollment = {
    classId: 1,
    studentId: "student-456",
  };

  it("accepts a valid enrollment object", () => {
    expect(enrollmentSchema.safeParse(validEnrollment).success).toBe(true);
  });

  it("coerces classId from string", () => {
    const result = enrollmentSchema.safeParse({
      ...validEnrollment,
      classId: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.classId).toBe(5);
    }
  });

  it("rejects classId of 0", () => {
    const result = enrollmentSchema.safeParse({
      ...validEnrollment,
      classId: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/class id is required/i);
    }
  });

  it("rejects non-numeric classId string", () => {
    const result = enrollmentSchema.safeParse({
      ...validEnrollment,
      classId: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty studentId", () => {
    const result = enrollmentSchema.safeParse({
      ...validEnrollment,
      studentId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(
        /student id is required/i
      );
    }
  });
});