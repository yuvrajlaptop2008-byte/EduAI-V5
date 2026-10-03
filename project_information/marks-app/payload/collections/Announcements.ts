import { CollectionConfig } from "payload/types";

export const Announcements: CollectionConfig = {
  slug: "announcements",
  admin: {
    useAsTitle: "title",
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
      name: "message",
      type: "textarea",
      required: true,
    },
    {
      name: "type",
      type: "select",
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Urgent Alert", value: "alert" },
      ],
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "targetRoles",
      type: "select",
      hasMany: true,
      options: [
        { label: "Students", value: "student" },
        { label: "Teachers", value: "teacher" },
        { label: "Parents", value: "parent" },
        { label: "All Users", value: "all" },
      ],
    },
  ],
};
