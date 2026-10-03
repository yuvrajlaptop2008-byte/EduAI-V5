import { CollectionConfig } from "payload/types";

export const Questions: CollectionConfig = {
  slug: "questions",
  admin: {
    useAsTitle: "text",
    defaultColumns: ["text", "subject", "chapter", "difficulty", "exam", "status"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "text",
      type: "textarea",
      required: true,
      label: "Question Body (LaTeX / Markdown)",
    },
    {
      name: "subject",
      type: "select",
      required: true,
      options: [
        { label: "Physics", value: "Physics" },
        { label: "Chemistry", value: "Chemistry" },
        { label: "Mathematics", value: "Mathematics" },
        { label: "Biology", value: "Biology" },
      ],
    },
    {
      name: "chapter",
      type: "text",
      required: true,
    },
    {
      name: "topic",
      type: "text",
    },
    {
      name: "difficulty",
      type: "select",
      required: true,
      defaultValue: "Medium",
      options: [
        { label: "Easy", value: "Easy" },
        { label: "Medium", value: "Medium" },
        { label: "Hard", value: "Hard" },
      ],
    },
    {
      name: "options",
      type: "array",
      required: true,
      minRows: 4,
      maxRows: 4,
      fields: [
        {
          name: "optionText",
          type: "text",
          required: true,
          label: "Option LaTeX Text",
        },
      ],
    },
    {
      name: "correctAnswer",
      type: "number",
      required: true,
      min: 0,
      max: 3,
      label: "Correct Option Index (0 = A, 1 = B, 2 = C, 3 = D)",
    },
    {
      name: "solution",
      type: "textarea",
      label: "Step-by-Step LaTeX Explanation",
    },
    {
      name: "exam",
      type: "select",
      required: true,
      defaultValue: "JEE Main",
      options: [
        { label: "JEE Main", value: "JEE Main" },
        { label: "JEE Advanced", value: "JEE Advanced" },
        { label: "NEET", value: "NEET" },
        { label: "BITSAT", value: "BITSAT" },
      ],
    },
    {
      name: "year",
      type: "number",
    },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Pending Review", value: "pending" },
        { label: "Archived", value: "archived" },
      ],
    },
  ],
};
