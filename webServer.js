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
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

const processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);

const requireLogin = function (request, response, next) {
  if (request.session && request.session.user) {
    next();
    return;
  }
  response.status(401).send("Unauthorized");
};

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use express static module to serve all files in the current directory
app.use(express.static(__dirname));
// Add body parser and session middleware
app.use(bodyParser.json());
app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: false })
);

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
app.get("/user/list", requireLogin, async function (request, response) {
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
app.get("/user/:id", requireLogin, async function (request, response) {
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
app.get("/photosOfUser/:id", requireLogin, async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send({ message: "Invalid user id" });
    return;
  }

  try {
    const photos = await Photo.find({ user_id: id })
      .sort({ date_time: 1 })
      .lean();

    if (!photos || photos.length === 0) {
      response.status(200).send([]);
      return;
    }

    const owner = await User.findById(id)
      .select("_id first_name last_name")
      .lean();

    const commenterIds = new Set();
    photos.forEach((photo) => {
      (photo.comments || []).forEach((comment) => {
        if (comment.user_id) {
          commenterIds.add(String(comment.user_id));
        }
      });
    });

    const commenters = await User.find({
      _id: { $in: Array.from(commenterIds) },
    })
      .select("_id first_name last_name")
      .lean();

    const commenterMap = new Map();
    commenters.forEach((user) => {
      commenterMap.set(String(user._id), {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    });

    const formatted = photos.map((photo) => {
      const formattedComments = (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user_id: comment.user_id,
        user: commenterMap.get(String(comment.user_id)) || null,
      }));
      const ownerInfo = owner
        ? {
            _id: owner._id,
            first_name: owner.first_name,
            last_name: owner.last_name,
          }
        : null;
      return {
        _id: photo._id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        user_id: photo.user_id,
        user: ownerInfo,
        comments: formattedComments,
      };
    });

    response.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching photos:", err);
    response.status(500).send({ message: "Internal server error" });
  }
});


/**
 * URL /mostRecentPhotoOfUser/:id - Returns the most recently uploaded
 * photo for a given User (id).
 * (User Story 1)
 */
app.get("/mostRecentPhotoOfUser/:id", requireLogin, async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user id format");
  }

  try {
    const photo = await Photo.findOne({ user_id: id })
      .sort({ date_time: -1 })
      .select("_id file_name date_time user_id")
      .lean();

    if (!photo) {
      return response.status(404).send("No photos for this user");
    }

    return response.status(200).json(photo);
  } catch (err) {
    console.error("Error in /mostRecentPhotoOfUser:", err);
    return response.status(500).send("Internal server error");
  }
});

/**
 * URL /mostCommentedPhotoOfUser/:id - Returns the photo belonging to the user
 * that has the highest number of comments (with the comment count).
 * (User Story 3)
 */
app.get("/mostCommentedPhotoOfUser/:id", requireLogin, async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user id format");
  }

  try {
    const [mostCommented] = await Photo.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(id) } },
      {
        $addFields: {
          commentCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      { $sort: { commentCount: -1, date_time: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 1,
          file_name: 1,
          date_time: 1,
          user_id: 1,
          commentCount: 1,
        },
      },
    ]);

    if (!mostCommented) {
      return response.status(404).send("No photos for this user");
    }

    return response.status(200).json(mostCommented);
  } catch (err) {
    console.error("Error in /mostCommentedPhotoOfUser:", err);
    return response.status(500).send("Internal server error");
  }
});


/**
 * URL /commentsOfPhoto/:photo_id: add comment to photo
 * rejects empty comments with code 400
 */
app.post(
  "/commentsOfPhoto/:photo_id",
  requireLogin,
  async function (request, response) {
  const photoId = request.params.photo_id;
  const text = request.body && request.body.comment;

  // the sprint says we can't post empty comments
  if (!text || text.trim().length === 0) {
    return response.status(400).send("Comment cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return response.status(400).send("Invalid photo id");
  }

  try {
    const photo = await Photo.findById(photoId).exec();
    if (!photo) {
      return response.status(400).send("Photo not found");
    }

    const newComment = {
      _id: mongoose.Types.ObjectId(),
      comment: text,
      user_id: request.session.user._id,
      date_time: new Date(),
    };

    if (!Array.isArray(photo.comments)) {
      photo.comments = [];
    }
    // add
    photo.comments.push(newComment);

    await photo.save();

    // return the newly added comment enriched with user info
    const commentResponse = {
      ...newComment,
      user: {
        _id: request.session.user._id,
        first_name: request.session.user.first_name,
        last_name: request.session.user.last_name,
      },
    };

    return response.status(200).json(commentResponse);
  } catch (err) {
    console.error("Error adding comment: ", err);
    return response.status(500).send("Internal server error");
  }
  }
);




/**
 * URL /user - Creates a new User document in MongoDB.
 * Validates required fields and checks for unique login_name.
 */
app.post("/user", async function (request, response) {
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    } = request.body;

    // Validate required fields
    if (!login_name || !password || !first_name || !last_name) {
      return response.status(400).send("Required fields missing");
    }

    // Check if login_name already exists
    const existingUser = await User.findOne({ login_name: login_name }).exec();
    if (existingUser) {
      return response.status(400).send("Login name already taken");
    }

    // Create new User object
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    // Save new user in MongoDB
    const savedUser = await newUser.save();

    // Remove password before sending response
    const cleanUser = savedUser.toObject();
    delete cleanUser.password;

    // Success: return the created user object
    return response.status(200).send(cleanUser);

  } catch (err) {
    console.error("Error creating user:", err);
    return response.status(500).send(JSON.stringify(err));
  }
});

app.post("/photos/new", requireLogin, function (request, response) {
  processFormBody(request, response, async function (err) {
    if (err) {
      console.error("Error processing upload:", err);
      response.status(500).send("Error processing upload");
      return;
    }

    if (!request.file) {
      response.status(400).send("No file provided");
      return;
    }

    const timestamp = new Date().valueOf();
    const originalName = path.basename(request.file.originalname || "upload");
    const filename = `U${timestamp}_${originalName}`;
    const imagePath = path.join(__dirname, "images", filename);

    fs.writeFile(imagePath, request.file.buffer, async function (writeErr) {
      if (writeErr) {
        console.error("Error saving image:", writeErr);
        response.status(500).send("Unable to save image");
        return;
      }

      try {
        const photo = await Photo.create({
          file_name: filename,
          user_id: mongoose.Types.ObjectId(request.session.user._id),
          date_time: new Date(),
          comments: [],
        });
        response.status(200).send(photo);
      } catch (dbErr) {
        console.error("Error storing photo metadata:", dbErr);
        response.status(500).send("Unable to save photo metadata");
      }
    });
  });
});

app.post("/admin/login", async function (request, response) {
  const { login_name: loginName, password } = request.body || {};

  if (!loginName || !password) {
    response.status(400).send("Missing credentials");
    return;
  }

  try {
    const user = await User.findOne({ login_name: loginName }).lean();

    if (!user || user.password !== password) {
      response.status(400).send("Invalid login name or password");
      return;
    }

    const safeUser = {
      _id: user._id,
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    };

    request.session.user = safeUser;

    response.status(200).send(safeUser);
  } catch (err) {
    console.error("Login error:", err);
    response.status(500).send("Internal server error");
  }
});

/**
 * URL /admin/logout - Logs out the current user by destroying the session.
 * Returns 200 on success, 400 if there was no logged-in user.
 */
app.post("/admin/logout", function (request, response) {
  if (!request.session || !request.session.user) {
    response.status(400).send("Not logged in");
    return;
  }

  request.session.destroy(function (err) {
    if (err) {
      console.error("Error destroying session:", err);
      response.status(500).send("Error logging out");
      return;
    }
    response.status(200).send("OK");
  });
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
