const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeServerAndDataBase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started...");
    });
  } catch (error) {
    console.log(`server get an error ${error}`);
    process.exit(1);
  }
};

initializeServerAndDataBase();

const hsaPriorityAndStatusProperties = (requestQuery) => {
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
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasSearchProperty = (requestQuery) => {
  requestQuery.search_q !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.dueDate,
  };
};

//API-1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", category, status, priority } = request.query;

  switch (true) {
    case hsaPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                        SELECT *
                        FROM todo 
                        WHERE priority = '${priority}' AND status = '${status}';
                    `;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategoryAndStatusProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                        SELECT *
                        FROM todo 
                        WHERE category = '${category}' AND status = '${status}';
                    `;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasCategoryAndPriorityProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "LOW" ||
          priority === "MEDIUM"
        ) {
          getTodosQuery = `
                 SELECT *
                 FROM todo 
                 WHERE category = '${category}' AND status = '${status}';
                `;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => outPutResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
                SELECT *
                FROM todo
                WHERE category = '${category}';
              `;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => outPutResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
                SELECT *
                FROM todo
                WHERE priority = '${priority}'; 
              `;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => outPutResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
                  SELECT *
                  FROM todo
                  WHERE status = '${status}'; 
                  `;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => outPutResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasSearchProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%';
          `;
      data = await db.all(getTodosQuery);
      response.send(data.map((eachItem) => outPutResult(eachItem)));
      break;
    default:
      getTodosQuery = `
            SELECT *
            FROM todo;
         `;
      data = await db.all(getTodosQuery);
      response.send(data.map((eachItem) => outPutResult(eachItem)));
  }
});

//API-2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  getTodosQuery = `
        SELECT *
        FROM todo
        WHERE id = ${todoId};
    `;
  data = await db.get(getTodosQuery);
  response.send(outPutResult(data));
});

//API-3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const requestQuery = `
            SELECT *
            FROM todo
            WHERE due_date = '${newDate}';
        `;
    const responseRes = await db.all(requestQuery);
    response.send(responseRes.map((eachItem) => outPutResult(eachItem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API-4

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(date, "yyyy-MM-dd")) {
          const postDate = format(new Date(dueDate), "yyyy-MM-dd");
          const Query = `
                        INSERT INTO todo (id , todo , category , priority , status , due_date)
                        VALUES (
                            ${id},
                            '${todo}',
                            '${category}',
                            '${priority}',
                            '${status}',
                            '${dueDate}'
                        );
                        `;
          data = await db.run(Query);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

// API - 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateColumn = "";
  const requestDetails = request.body;
  const previousQuery = `
        SELECT *
        FROM todo
        WHERE id = ${todoId};
    `;
  const previousTodo = await db.get(previousQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updateTodoQuery;

  switch (true) {
    case requestDetails.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
                    UPDATE todo 
                    SET todo = '${todo}',
                    priority = '${priority}', 
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};
                `;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestDetails.priority !== undefined:
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        updateTodoQuery = `
                    UPDATE todo 
                    SET todo = '${todo}',
                    priority = '${priority}', 
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};
                `;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestDetails.category !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `
                    UPDATE todo 
                    SET todo = '${todo}',
                    priority = '${priority}', 
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};
                `;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestDetails.todo !== undefined:
      updateTodoQuery = `
                    UPDATE todo 
                    SET todo = '${todo}',
                    priority = '${priority}', 
                    status = '${status}',
                    category = '${category}',
                    due_date = '${dueDate}'
                    WHERE id = ${todoId};
                `;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case requestDetails.dueDate !== undefined:
      if (isMatch(date, "yyyy-MM-dd")) {
        const newDate = format(new Date(date), "yyyy-MM-dd");
        updateTodoQuery = `
                    UPDATE todo 
                    SET todo = '${todo}',
                    priority = '${priority}', 
                    status = '${status}',
                    category = '${category}',
                    due_date = '${newDate}'
                    WHERE id = ${todoId};
                `;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
  }
});

//API - 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const Query = `
        DELETE FROM todo 
        WHERE id = ${todoId};
    `;
  await db.run(Query);
  response.send("Todo Deleted");
});

module.exports = app;
