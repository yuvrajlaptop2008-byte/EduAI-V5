import { buildConfig } from "payload/config";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import path from "path";

// Collections
import { Questions } from "./payload/collections/Questions";
import { Formulas } from "./payload/collections/Formulas";
import { Announcements } from "./payload/collections/Announcements";
import { Media } from "./payload/collections/Media";
import { Users } from "./payload/collections/Users";

export default buildConfig({
  serverURL: process.env.SERVER_URL || "http://localhost:3000",
  admin: {
    user: Users.slug,
  },
  editor: slateEditor({}),
  collections: [
    Users,
    Questions,
    Formulas,
    Announcements,
    Media,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, "src/types/payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://yuvrajlaptop2008_db_user:fwiRnAOWord88J5M@cluster0.gw4fnan.mongodb.net/marksapp_questions?retryWrites=true&w=majority",
  }),
});
