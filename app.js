const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);

    process.exit(1);
  }
};

initializeDbAndServer();

const convertObject = (dbObject) => {
  return {
    id: dbObject.id,

    todo: dbObject.todo,

    priority: dbObject.priority,

    category: dbObject.category,

    status: dbObject.status,

    dueDate: dbObject.due_date,
  };
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const haspriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hastodo = (responseQuery) => {
  return responseQuery.todo !== undefined;
};

const hasprioritystatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const hasseacrh_q = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hascategorystatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};

const hascategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasprioritycategory = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  let data = null;

  let getTodosQuery = "";

  const {
    search_q,

    priority,

    status,

    id,

    todo,

    category,

    duedate,
  } = request.query;

  switch (true) {
    case hasStatusProperty(request.query):
      getTodosQuery = `

      SELECT

        *

      FROM

        todo 

        where status = '${status}';`;

      break;

    case haspriority(request.query):
      getTodosQuery = `

        select *

        from todo

        where priority = '${priority}';`;

      break;

    case hasprioritystatus(request.query):
      getTodosQuery = `

        select *

        from todo

        where status = '${status}'

        and priority = '${priority}';`;

      break;

    case hasseacrh_q(request.query):
      getTodosQuery = `

        search *

        from todo

        where todo like "%Buy%";`;

      break;

    case hascategorystatus(requestQuery):
      getTodosQuery = `

        select *

        from todo

        where category = '${category}'

        and status = '${status}';`;

      break;

    case hascategory(request.query):
      getTodosQuery = `

        select *

        from todo

        where category = "${category}";`;

      break;

    case hasprioritycategory(request.query):
      getTodosQuery = `

        select *

        from todo

        where category = "${category}"

        and priority = "${priority}";`;

      break;
  }

  const user = await database.all(getTodosQuery);

  response.send(convertObject(user));
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getQuery = `

    select *

    from todo

    where id="${todoId}";`;

  const user = await database.all(getQuery);

  response.send(user.map((each) => convertObject(each)));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  const dateQuery = `

    select *

    from todo 

    where due_date="${date}";`;

  const data = await database.all(dateQuery);

  response.send(data.map((each) => convertObject(each)));
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const newQuery = `

    insert into 

    todo (id,todo,priority,status,category,due_date)

    values ('${id}','${todo}','${priority}','${status}','${category}','${dueDate}');

    `;

  const newuser = await database.run(newQuery);

  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  let putQuery = "";

  const { status, dueDate, category, todo, priority } = request.query;

  switch (true) {
    case hasStatusProperty(request.query):
      value = Status;

      putQuery = `update

            todo

            set status ="${status}";`;

      break;

    case haspriority(request.query):
      value = Priority;

      putQuery = `update todo

            set priority = "${priority}";`;

      break;

    case hastodo(request.query):
      value = Todo;

      putQuery = `update todo

            set todo = "${todo}";`;

      break;

    case hascategory(request.query):
      value = Category;

      putQuery = `update todo

            set category = "${category}";`;

      break;

    case hasduedate(request.query):
      value = "Due Date";

      putQuery = `update todo

            set due_date = "${dueDate}";`;

      console.log("date changed");

      break;
  }

  const newdata = await database.run(putQuery);

  response.send("${value} Updated");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const delQuery = `

    delete from todo

    where id = "${todoId}";`;

  const del = await database.run(delQuery);

  response.send("Todo Deleted");
});

module.exports = app;
