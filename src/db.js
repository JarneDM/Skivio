import Dexie from "dexie";
import dexieCloud from "dexie-cloud-addon";

export const db = new Dexie("BoardlyDB", { addons: [dexieCloud] });
db.version(1).stores({
  users: "@id, username, email, password",
  projects: "@id, name",
  tasks: "@id, title, description, status, labels, projectId, [status+projectId], duedate",
  labels: "@id, name",
});

db.cloud.configure({
  databaseUrl: import.meta.env.DB_URL,
  requireAuth: true,
});

db.on("populate", () => {
  db.projects.bulkPut([{ name: "My Project" }, { name: "Work" }]);
  db.labels.bulkPut([
    { name: "Urgent" },
    { name: "Low Priority" },
    { name: "Bug" },
    { name: "Feature" },
    { name: "School" },
    { name: "Personal" },
  ]);
});

db.open();
