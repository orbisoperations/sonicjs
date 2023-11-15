import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";

import {ApiConfig, SchemaExporter} from "../cms/types/schema"

// we want to add the below audit fields to all our tables, so we'll define it here
// and append it to the rest of the schema for each table
export const auditSchema = {
  createdOn: integer("createdOn"),
  updatedOn: integer("updatedOn"),
};

/*
 **** TABLES ****
 */

export const profileSchema = {
  id: text("id").primaryKey(),
  name: text("name")
}

export const profileTable = sqliteTable("profiles", {
  ...profileSchema,
  ...auditSchema,
})

// users
export const userSchema = {
  id: text("id").primaryKey(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
};
export const usersTable = sqliteTable("users", {
  ...userSchema,
  ...auditSchema,
});

// posts
type PostCategories = [{ category: string }];

export const postSchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("userId"),
};
export const postsTable = sqliteTable(
  "posts",
  {
    ...postSchema,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("postUserIdIndex").on(table.userId),
    };
  }
);

// categories
export const categorySchema = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
};
export const categoriesTable = sqliteTable("categories", {
  ...categorySchema,
  ...auditSchema,
});

// comments
export const commentSchema = {
  id: text("id").primaryKey(),
  body: text("body"),
  userId: text("userId"),
  postId: integer("postId"),
};

export const commentsTable = sqliteTable(
  "comments",
  {
    ...commentSchema,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("commentsUserIdIndex").on(table.userId),
      postIdIndex: index("commentsPostIdIndex").on(table.postId),
    };
  }
);

//posts to categories (many to many)
export const categoriesToPostsSchema = {
  id: text("id").notNull(),
  postId: text("postId")
    .notNull()
    .references(() => postsTable.id),
  categoryId: text("categoryId")
    .notNull()
    .references(() => categoriesTable.id),
};

export const categoriesToPostsTable = sqliteTable(
  "categoriesToPosts",
  {
    ...categoriesToPostsSchema,
    ...auditSchema,
  },
  (table) => ({
    pk: primaryKey(table.postId, table.categoryId),
  })
);
/*
 **** TABLES RELATIONSHIPS ****
 */

// users can have many posts and many comments
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  comments: many(commentsTable),
}));

// posts can have one author (user), many categories, many comments
export const postsRelations = relations(postsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
  categories: many(categoriesToPostsTable),
  comments: many(commentsTable),
}));

// categories can have many posts
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  posts: many(categoriesToPostsTable),
}));

// comments can have one post and one author
export const commentsRelations = relations(commentsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [commentsTable.postId],
    references: [postsTable.id],
  }),
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
}));

//many to many between posts and categories
export const categoriesToPostsRelations = relations(
  categoriesToPostsTable,
  ({ one }) => ({
    category: one(categoriesTable, {
      fields: [categoriesToPostsTable.categoryId],
      references: [categoriesTable.id],
    }),
    post: one(postsTable, {
      fields: [categoriesToPostsTable.postId],
      references: [postsTable.id],
    }),
  })
);



//create an entry for each table
export class ProjectSchemaExporter implements SchemaExporter{
  getRoutes(): ApiConfig[] {
    return [
      { table: "users", route: "users" },
      { table: "posts", route: "posts" },
      { table: "categories", route: "categories" },
      { table: "comments", route: "comments" },
      { table: "categoriesToPosts", route: "categories-to-posts" },
      { table: "profiles", route: "profiles"}
    ]
  }
  lookupSchema(name: string) {
    switch (name) {
      case "users":
        return userSchema;
        break;
      case "posts":
        return postSchema;
        break;
      case "categories":
        return categorySchema;
        break;
      case "comments":
        return commentSchema;
        break;
      case "categoriesToPosts":
        return categoriesToPostsSchema;
        break;
      case "profiles":
        return profileSchema;
        break;
    }
  }

  lookupTable(name: string) {
    switch (name) {
      case "users":
        return usersTable;
        break;
      case "posts":
        return postsTable;
        break;
      case "categories":
        return categoriesTable;
        break;
      case "comments":
        return commentsTable;
        break;
      case "categoriesToPosts":
        return categoriesToPostsTable;
        break;
      case "profiles":
        return profileTable;
        break;
    }
  }
}
