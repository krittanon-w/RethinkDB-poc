var rethink = require("rethinkdb");
var r = rethink;

// Open a connection
var connection = null;
rethink.connect(
  { host: "rethink-db", port: 28015 },
  (err, conn) => {
    if (err) throw err;
    console.log("RethinkDB is connected");
    connection = conn;
    createTable();
  }
);

// Create a new table
function createTable() {
  rethink
    .db("test")
    .tableCreate("authors")
    .run(connection, (err, result) => {
      if (err) throw err;
      console.log("Table Creation results:");
      console.log(JSON.stringify(result, null, 2));
      insertData();
    });
}

// Insert data
function insertData() {
  rethink
    .table("authors")
    .insert([
      {
        name: "William Adama",
        tv_show: "Battlestar Galactica",
        rank: 1,
        posts: [
          {
            title: "Decommissioning speech",
            content: "The Cylon War is long over..."
          },
          {
            title: "We are at war",
            content: "Moments ago, this ship received word..."
          },
          {
            title: "The new Earth",
            content: "The discoveries of the past few days..."
          }
        ]
      },
      {
        name: "Laura Roslin",
        tv_show: "Battlestar Galactica",
        rank: 2,
        posts: [
          { title: "The oath of office", content: "I, Laura Roslin, ..." },
          {
            title: "They look like us",
            content: "The Cylons have the ability..."
          }
        ]
      },
      {
        name: "Jean-Luc Picard",
        tv_show: "Star Trek TNG",
        rank: 3,
        posts: [
          {
            title: "Civil rights",
            content: "There are some words I've known since..."
          }
        ]
      }
    ])
    .run(connection, (err, result) => {
      if (err) throw err;
      console.log("Insertion results:");
      console.log(JSON.stringify(result, null, 2));
      retrieveData();
    });
}

// Retrieve documents
function retrieveData() {
  rethink.table("authors").run(connection, (err, cursor) => {
    if (err) throw err;
    cursor.toArray((err, result) => {
      if (err) throw err;
      console.log("Retrieval results:");
      console.log(JSON.stringify(result, null, 2));
      realtimeFeedData();
    });
  });
}

// Realtime feeds
function realtimeFeedData() {
  console.log("Start realtime feed, wait 1 sec for updating ...");
  rethink
    .table("authors")
    .changes()
    .run(connection, (err, cursor) => {
      if (err) throw err;
      cursor.each((err, row) => {
        if (err) throw err;
        console.log("Realtime feed results:");
        console.log(JSON.stringify(row, null, 2));
      });
    });

  setTimeout(() => {
    rethink
      .table("authors")
      .filter(r.row("name").eq("William Adama"))
      .update({ rank: 3 })
      .run(connection, (err, result) => {
        if (err) throw err;
        console.log("update at 'William Adama' ... ");
        console.log(JSON.stringify(result, null, 2));
      });
  }, 1000);

  setTimeout(() => {
    rethink
      .table("authors")
      .filter(r.row("name").eq("Laura Roslin"))
      .update({ rank: 1 })
      .run(connection, (err, result) => {
        if (err) throw err;
        console.log("update at 'Laura Roslin' ... ");
        console.log(JSON.stringify(result, null, 2));
      });
  }, 2000);

  setTimeout(() => {
    rethink
      .table("authors")
      .filter(r.row("name").eq("Jean-Luc Picard"))
      .update({ rank: 2 })
      .run(connection, (err, result) => {
        if (err) throw err;
        console.log("update at 'Jean-Luc Picard' ... ");
        console.log(JSON.stringify(result, null, 2));
      });
  }, 3000);
}
