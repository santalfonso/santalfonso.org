import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor", "utente"] })
    .notNull()
    .default("editor"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  coverImageUrl: text("cover_image_url"),
  coverImageFocus: text("cover_image_focus").default("50% 50%"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  posterUrl: text("poster_url"),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("Documenti"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const articleImages = sqliteTable("article_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id").notNull(),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().default(""),
  text: text("text").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// --- Lodate, lodate Iddio ---

export const songs = sqliteTable("songs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  author: text("author"),
  copyrightNote: text("copyright_note"),
  musicalKey: text("musical_key"),
  // Testo in ChordPro ridotto: [G]accordi in linea, {soc}/{eoc}, {c: commento}
  body: text("body").notNull(),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const songMoments = sqliteTable(
  "song_moments",
  {
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    moment: text("moment").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.songId, t.moment] }),
    index("song_moments_moment_idx").on(t.moment),
  ]
);

export const songSeasons = sqliteTable(
  "song_seasons",
  {
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    season: text("season").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.songId, t.season] }),
    index("song_seasons_season_idx").on(t.season),
  ]
);

export const setlists = sqliteTable(
  "setlists",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    publicId: text("public_id").notNull().unique(),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    celebrationDate: text("celebration_date"),
    feast: text("feast"),
    extraLabel: text("extra_label"),
    extraAfter: text("extra_after"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    index("setlists_owner_idx").on(t.ownerId),
    index("setlists_date_idx").on(t.celebrationDate),
  ]
);

export const setlistItems = sqliteTable(
  "setlist_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    setlistId: integer("setlist_id")
      .notNull()
      .references(() => setlists.id, { onDelete: "cascade" }),
    moment: text("moment").notNull(),
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("setlist_items_setlist_idx").on(t.setlistId)]
);

export const favoriteSongs = sqliteTable(
  "favorite_songs",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.songId] })]
);

export const songAnnotations = sqliteTable(
  "song_annotations",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    // JSON: [{ line, col, mark: "up" | "down" | "steady" }]
    data: text("data").notNull().default("[]"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.songId] })]
);

export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type ArticleImage = typeof articleImages.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type Song = typeof songs.$inferSelect;
export type Setlist = typeof setlists.$inferSelect;
export type SetlistItem = typeof setlistItems.$inferSelect;
