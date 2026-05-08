/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);

  // ─────────────────────────────────────────────
  // 1. Extend the built-in "users" auth collection
  // ─────────────────────────────────────────────
  const users = dao.findCollectionByNameOrId("users");

  const usersExtra = [
    { name: "full_name", type: "text",   required: false, options: { min: null, max: null, pattern: "" } },
    { name: "bio",       type: "text",   required: false, options: { min: null, max: null, pattern: "" } },
    { name: "city",      type: "text",   required: false, options: { min: null, max: null, pattern: "" } },
    { name: "website",   type: "url",    required: false, options: { exceptDomains: null, onlyDomains: null } },
    { name: "twitter",   type: "text",   required: false, options: { min: null, max: null, pattern: "" } },
    { name: "linkedin",  type: "text",   required: false, options: { min: null, max: null, pattern: "" } },
    { name: "github",    type: "text",   required: false, options: { min: null, max: null, pattern: "" } },
    { name: "role",      type: "text",   required: false, options: { min: null, max: null, pattern: "" } },
    { name: "avatar",    type: "file",   required: false, options: { mimeTypes: ["image/jpeg","image/png","image/gif","image/webp"], maxSelect: 1, maxSize: 5242880, protected: false } },
    { name: "banner",    type: "file",   required: false, options: { mimeTypes: ["image/jpeg","image/png","image/gif","image/webp"], maxSelect: 1, maxSize: 10485760, protected: false } },
  ];

  for (const fieldDef of usersExtra) {
    // Only add if not already present
    if (!users.schema.getFieldByName(fieldDef.name)) {
      users.schema.addField(new SchemaField(fieldDef));
    }
  }

  // Open up profile viewing
  users.listRule  = null;   // public list
  users.viewRule  = null;   // public view
  users.updateRule = "@request.auth.id = id";
  users.deleteRule = "@request.auth.id = id";

  dao.saveCollection(users);

  // ─────────────────────────────────────────────
  // 2. projects
  // ─────────────────────────────────────────────
  const projects = new Collection({
    name:       "projects",
    type:       "base",
    listRule:   'visibility = "public"',
    viewRule:   'visibility = "public"',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id = user.id',
    deleteRule: '@request.auth.id = user.id',
    schema: [
      { name: "user",              type: "relation", required: true,  options: { collectionId: users.id, cascadeDelete: true,  maxSelect: 1, minSelect: 0, displayFields: ["username","full_name"] } },
      { name: "title",             type: "text",     required: true,  options: { min: 3, max: null, pattern: "" } },
      { name: "short_description", type: "text",     required: false, options: { min: null, max: 300, pattern: "" } },
      { name: "description",       type: "text",     required: false, options: { min: null, max: null, pattern: "" } },
      { name: "cover",             type: "file",     required: false, options: { mimeTypes: ["image/jpeg","image/png","image/gif","image/webp"], maxSelect: 1, maxSize: 10485760, protected: false } },
      { name: "video_url",         type: "url",      required: false, options: {} },
      { name: "github_url",        type: "url",      required: false, options: {} },
      { name: "demo_url",          type: "url",      required: false, options: {} },
      { name: "status",            type: "select",   required: false, options: { maxSelect: 1, values: ["in_development", "launched"] } },
      { name: "visibility",        type: "select",   required: false, options: { maxSelect: 1, values: ["public", "private"] } },
      { name: "likes_count",       type: "number",   required: false, options: { min: 0, max: null, noDecimal: true } },
      { name: "views_count",       type: "number",   required: false, options: { min: 0, max: null, noDecimal: true } },
    ],
    indexes: [],
  });
  dao.saveCollection(projects);

  // ─────────────────────────────────────────────
  // 3. products
  // ─────────────────────────────────────────────
  const products = new Collection({
    name:       "products",
    type:       "base",
    listRule:   'visibility = "public"',
    viewRule:   'visibility = "public"',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id = user.id',
    deleteRule: '@request.auth.id = user.id',
    schema: [
      { name: "user",         type: "relation", required: true,  options: { collectionId: users.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: ["username","full_name"] } },
      { name: "name",         type: "text",     required: true,  options: { min: 2, max: null, pattern: "" } },
      { name: "description",  type: "text",     required: false, options: { min: null, max: null, pattern: "" } },
      { name: "price",        type: "number",   required: true,  options: { min: 0, max: null, noDecimal: false } },
      { name: "category",     type: "text",     required: false, options: { min: null, max: null, pattern: "" } },
      { name: "stock",        type: "number",   required: false, options: { min: 0, max: null, noDecimal: true } },
      { name: "visibility",   type: "select",   required: false, options: { maxSelect: 1, values: ["public", "private"] } },
      { name: "images",       type: "file",     required: false, options: { mimeTypes: ["image/jpeg","image/png","image/gif","image/webp"], maxSelect: 5, maxSize: 5242880, protected: false } },
      { name: "rating_avg",   type: "number",   required: false, options: { min: 0, max: 5, noDecimal: false } },
      { name: "rating_count", type: "number",   required: false, options: { min: 0, max: null, noDecimal: true } },
      { name: "sales_count",  type: "number",   required: false, options: { min: 0, max: null, noDecimal: true } },
    ],
    indexes: [],
  });
  dao.saveCollection(products);

  // ─────────────────────────────────────────────
  // 4. project_tags
  // ─────────────────────────────────────────────
  const projectTags = new Collection({
    name:       "project_tags",
    type:       "base",
    listRule:   "",
    viewRule:   "",
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id = project.user.id',
    deleteRule: '@request.auth.id = project.user.id',
    schema: [
      { name: "project", type: "relation", required: true, options: { collectionId: projects.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "tag",     type: "text",     required: true, options: { min: 1, max: 50, pattern: "" } },
    ],
    indexes: [],
  });
  dao.saveCollection(projectTags);

  // ─────────────────────────────────────────────
  // 5. project_likes
  // ─────────────────────────────────────────────
  const projectLikes = new Collection({
    name:       "project_likes",
    type:       "base",
    listRule:   '@request.auth.id != ""',
    viewRule:   '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: null,
    deleteRule: '@request.auth.id = user.id',
    schema: [
      { name: "project", type: "relation", required: true, options: { collectionId: projects.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "user",    type: "relation", required: true, options: { collectionId: users.id,    cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
    ],
    indexes: [],
  });
  dao.saveCollection(projectLikes);

  // ─────────────────────────────────────────────
  // 6. comments
  // ─────────────────────────────────────────────
  const comments = new Collection({
    name:       "comments",
    type:       "base",
    listRule:   "",
    viewRule:   "",
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id = user.id',
    deleteRule: '@request.auth.id = user.id',
    schema: [
      { name: "project", type: "relation", required: true,  options: { collectionId: projects.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "user",    type: "relation", required: true,  options: { collectionId: users.id,    cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "content", type: "text",     required: true,  options: { min: 1, max: 2000, pattern: "" } },
    ],
    indexes: [],
  });
  dao.saveCollection(comments);

  // ─────────────────────────────────────────────
  // 7. reviews
  // ─────────────────────────────────────────────
  const reviews = new Collection({
    name:       "reviews",
    type:       "base",
    listRule:   "",
    viewRule:   "",
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id = user.id',
    deleteRule: '@request.auth.id = user.id',
    schema: [
      { name: "product", type: "relation", required: true,  options: { collectionId: products.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "user",    type: "relation", required: true,  options: { collectionId: users.id,    cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "rating",  type: "number",   required: true,  options: { min: 1, max: 5, noDecimal: true } },
      { name: "content", type: "text",     required: false, options: { min: null, max: 2000, pattern: "" } },
    ],
    indexes: [],
  });
  dao.saveCollection(reviews);

  // ─────────────────────────────────────────────
  // 8. follows
  // ─────────────────────────────────────────────
  const follows = new Collection({
    name:       "follows",
    type:       "base",
    listRule:   '@request.auth.id != ""',
    viewRule:   '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: null,
    deleteRule: '@request.auth.id = follower.id',
    schema: [
      { name: "follower",  type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "following", type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
    ],
    indexes: [],
  });
  dao.saveCollection(follows);

  // ─────────────────────────────────────────────
  // 9. notifications
  // ─────────────────────────────────────────────
  const notifications = new Collection({
    name:       "notifications",
    type:       "base",
    listRule:   '@request.auth.id = user.id',
    viewRule:   '@request.auth.id = user.id',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id = user.id',
    deleteRule: '@request.auth.id = user.id',
    schema: [
      { name: "user",    type: "relation", required: true,  options: { collectionId: users.id, cascadeDelete: true, maxSelect: 1, minSelect: 0, displayFields: [] } },
      { name: "type",    type: "text",     required: false, options: { min: null, max: null, pattern: "" } },
      { name: "message", type: "text",     required: true,  options: { min: 1, max: 500, pattern: "" } },
      { name: "link",    type: "url",      required: false, options: {} },
      { name: "read",    type: "bool",     required: false, options: {} },
    ],
    indexes: [],
  });
  dao.saveCollection(notifications);

}, (db) => {
  // REVERT — borra todo en orden inverso
  const dao = new Dao(db);
  const toDelete = [
    "notifications","follows","reviews","comments",
    "project_likes","project_tags","products","projects",
  ];
  for (const name of toDelete) {
    try {
      const col = dao.findCollectionByNameOrId(name);
      dao.deleteCollection(col);
    } catch (_) { /* ya no existe */ }
  }
});
