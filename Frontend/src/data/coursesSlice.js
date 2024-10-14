import { createSlice } from "@reduxjs/toolkit";

const courses = [
  {
    id: 1,
    title: "Introduction to React",
    description:
      "Learn the basics of React, a popular JavaScript library for building user interfaces.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Getting Started",
        modules: ["Module 1: Installation"],
      },
    ],
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    description: "Deep dive into JavaScript and explore its advanced features.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Advanced Functions",
        modules: ["Module 1: Closures"],
      },
    ],
  },
  {
    id: 3,
    title: "CSS Flexbox",
    description: "Master CSS Flexbox layout and build responsive designs.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Flexbox Basics",
        modules: ["Module 1: Flex Container"],
      },
    ],
  },
  {
    id: 4,
    title: "Node.js for Beginners",
    description: "Learn how to build server-side applications with Node.js.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Node.js Fundamentals",
        modules: ["Module 1: What is Node.js?"],
      },
    ],
  },
  {
    id: 5,
    title: "Understanding TypeScript",
    description:
      "Get to know TypeScript and how it improves JavaScript development.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Introduction to TypeScript",
        modules: ["Module 1: What is TypeScript?"],
      },
    ],
  },
  {
    id: 6,
    title: "React Hooks in Depth",
    description:
      "Dive into the world of React Hooks and how to use them effectively.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Introduction to Hooks",
        modules: ["Module 1: What are Hooks?"],
      },
    ],
  },
  {
    id: 7,
    title: "Responsive Web Design",
    description: "Learn how to design websites that look great on any device.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Responsive Design Principles",
        modules: ["Module 1: Mobile-First Approach"],
      },
    ],
  },
  {
    id: 8,
    title: "Node.js Advanced Concepts",
    description:
      "Explore advanced topics in Node.js for building scalable applications.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Advanced Node.js Concepts",
        modules: ["Module 1: Streams"],
      },
    ],
  },
  {
    id: 9,
    title: "CSS Grid Layout",
    description: "Understand CSS Grid and create complex responsive layouts.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: CSS Grid Basics",
        modules: ["Module 1: Grid Container"],
      },
    ],
  },
  {
    id: 10,
    title: "JavaScript Best Practices",
    description:
      "Learn best practices for writing clean and efficient JavaScript code.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Writing Clean Code",
        modules: ["Module 1: Naming Conventions"],
      },
    ],
  },
  {
    id: 11,
    title: "Building REST APIs with Node.js",
    description: "Learn how to build RESTful APIs using Node.js and Express.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Introduction to REST",
        modules: ["Module 1: What is REST?"],
      },
    ],
  },
  {
    id: 12,
    title: "Frontend Frameworks Overview",
    description:
      "Get an overview of popular frontend frameworks like Angular, Vue, and React.",
    rating: 0,
    status: "available",
    progress: 0,
    chapters: [
      {
        title: "Chapter 1: Overview of Frameworks",
        modules: ["Module 1: Angular"],
      },
    ],
  },
];

const initialState = {
  courses,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    updateCourseRating: (state, action) => {
      const { id, rating } = action.payload;
      const course = state.courses.find((course) => course.id == id);
      if (course) {
        course.rating = rating;
      }
    },
    updateCourseStatus: (state, action) => {
      const { id, status } = action.payload;
      const course = state.courses.find((course) => course.id == id);
      if (course) {
        course.status = status;
      }
    },
    updateCourseProgress: (state, action) => {
      const { id, progress } = action.payload;
      const course = state.courses.find((course) => course.id == id);
      if (course) {
        course.progress = progress;
      }
    },
  },
});

export const { updateCourseRating, updateCourseStatus, updateCourseProgress } =
  coursesSlice.actions;

export default coursesSlice.reducer;
