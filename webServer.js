/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch their reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");
const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
const models = require("./modelData/photoApp.js").models;

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use express static module to serve all files in the current directory
app.use(express.static(__dirname));

// Basic route to confirm the server is running
app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * URL /test/:p1
 * Handles testing endpoints:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 * /test/info   - Same as /test.
 * /test/counts - Returns the counts of the different collections in JSON.
 */
app.get("/test/:p1", function (request, response) {
  console.log("/test called with param1 = ", request.params.p1);
  const param = request.params.p1 || "info";

  if (param === "info") {
    // Return the SchemaInfo object
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        response.status(500).send("Missing SchemaInfo");
        return;
      }
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // Return the counts of all collections
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all User objects (id, first_name, last_name).
 */
app.get("/user/list", async function (request, response) {
  try {
    const users = await User.find({})
      .select("_id first_name last_name")
      .lean();
    response.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user list:", error);
    response.status(500).send({ message: "Internal server error" });
  }
});

/**
 * URL /user/:id - Returns the information for a specific User by ID.
 * Replaces the previous models.userModel() mock call.
 */
app.get("/user/:id", async function (request, response) {
  const id = request.params.id;

  // 1) Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send({ message: "Invalid user id format" });
    return;
  }

  try {
    // 2) Query MongoDB for the specific user and select only needed fields
    const user = await User.findById(id)
      .select("_id first_name last_name location description occupation")
      .lean();

    // 3) If no user found, return 400
    if (!user) {
      response.status(400).send({ message: "User not found" });
      return;
    }

    // 4) Success: return 200 OK + user object
    response.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    response.status(500).send({ message: "Internal server error" });
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for a given User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  const id = request.params.id;
  const photos = models.photoOfUserModel(id);
  if (photos.length === 0) {
    console.log("Photos for user with _id:" + id + " not found.");
    response.status(400).send("Not found");
    return;
  }
  response.status(200).send(photos);
});

// Start the web server
const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});