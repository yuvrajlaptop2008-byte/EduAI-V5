import { CollectionConfig } from "payload/types";

export const Formulas: CollectionConfig = {
  slug: "formulas",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "subject", "chapter"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
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
      name: "latexFormula",
      type: "textarea",
      required: true,
      label: "KaTeX Equation Block",
    },
    {
      name: "notes",
      type: "textarea",
      label: "Application Notes & Edge Cases",
    },
  ],
};
