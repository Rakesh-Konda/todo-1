const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;

const hlo = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(2000, () => {
      console.log("Server running ar http://localhost:2000/");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
hlo();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  const data = await db.all(getTodosQuery);
  response.send(data);
});

//get2
app.get(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo
    WHERE id=${todoId};`;
  const res = await db.get(query);
  response.send(res);
});

//post3
app.post("/todos/", async (request, response) => {
  const update = request.body;
  const { id, todo, priority, status } = update;
  const query = `INSERT INTO todo
    (id,todo,priority,status)
    VALUES (${id},"${todo}",
    "${priority}","${status}");`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

app.put(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const update = request.body;

  if (update.status) {
    const query = `UPDATE todo SET status="${update.status}" WHERE id=${todoId};`;
    await db.run(query);
    response.send("Status Updated");
  } else if (update.priority) {
    const query = `UPDATE todo SET priority="${update.priority}" WHERE id=${todoId};`;
    await db.run(query);
    response.send("Priority Updated");
  } else if (update.todo) {
    const query = `UPDATE todo SET todo="${update.todo}" WHERE id=${todoId};`;
    await db.run(query);
    response.send("Todo Updated");
  } else {
    response.status(400).send("Bad Request");
  }
});

//delete 5
app.delete(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo
    WHERE id=${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
