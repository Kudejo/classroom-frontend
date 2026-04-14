import { Subject } from "@/types";

export const mockSubjects: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "Computer Science",
    description: "Fundamentals of computer science, algorithms, and programming concepts.",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    code: "MATH201",
    name: "Calculus II",
    department: "Mathematics",
    description: "Advanced calculus covering integration techniques, series, and differential equations.",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 3,
    code: "PHYS150",
    name: "Physics for Engineers",
    department: "Physics",
    description: "Applied physics principles including mechanics, thermodynamics, and electromagnetism.",
    createdAt: "2024-01-15T11:00:00Z",
  },
];