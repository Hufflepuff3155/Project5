"use strict";

const assert = require("assert");
const http = require("http");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const host = "localhost";
const port = 3000;
const baseUrl = `http://${host}:${port}`;

let sessionCookie = "";

function loginUser(loginName, password) {
  return new Promise((resolve, reject) => {
    const loginBody = JSON.stringify({ login_name: loginName, password });
    const options = {
      hostname: host,
      port: port,
      path: "/admin/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginBody),
      },
    };
    const req = http.request(options, function (response) {
      let body = "";
      response.on("data", function (chunk) {
        body += chunk;
      });
      response.on("end", function () {
        if (response.statusCode !== 200) {
          reject(new Error("Login failed"));
          return;
        }
        const setCookie = response.headers["set-cookie"];
        sessionCookie = setCookie && setCookie.length > 0 ? setCookie[0].split(";")[0] : "";
        resolve();
      });
    });
    req.on("error", reject);
    req.write(loginBody);
    req.end();
  });
}

describe("Session/Input API", function () {
  it("rejects protected endpoints without login", function (done) {
    http.get(
      {
        hostname: host,
        port: port,
        path: "/user/list",
      },
      function (response) {
        assert.strictEqual(response.statusCode, 401);
        done();
      }
    );
  });

  it("rejects invalid login", function (done) {
    const body = JSON.stringify({ login_name: "nosuchuser", password: "bad" });
    const options = {
      hostname: host,
      port: port,
      path: "/admin/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = http.request(options, function (response) {
      assert.strictEqual(response.statusCode, 400);
      done();
    });
    req.on("error", done);
    req.write(body);
    req.end();
  });

  it("can login a valid user", async function () {
    await loginUser("malcolm", "weak");
    assert(sessionCookie && sessionCookie.length > 0, "No session cookie set");
  });

  it("can register a new user", async function () {
    const loginName = `newuser${Date.now()}`;
    const res = await axios.post(`${baseUrl}/user`, {
      login_name: loginName,
      password: "weak",
      first_name: "Test",
      last_name: "User",
      location: "Somewhere",
      description: "Test registration",
      occupation: "Tester",
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.login_name, loginName);
  });

  it("adds a comment to a photo", async function () {
    await loginUser("malcolm", "weak");
    const usersRes = await axios.get(`${baseUrl}/user/list`, {
      headers: { Cookie: sessionCookie },
    });
    const malcolm = usersRes.data.find((u) => u.last_name === "Malcolm");
    assert(malcolm, "Missing Malcolm user");

    const photosRes = await axios.get(`${baseUrl}/photosOfUser/${malcolm._id}`, {
      headers: { Cookie: sessionCookie },
    });
    assert(photosRes.data.length > 0, "No photos returned for Malcolm");
    const photoId = photosRes.data[0]._id;

    const commentRes = await axios.post(
      `${baseUrl}/commentsOfPhoto/${photoId}`,
      { comment: "Test comment" },
      { headers: { Cookie: sessionCookie } }
    );
    assert.strictEqual(commentRes.status, 200);
    assert.strictEqual(commentRes.data.comment, "Test comment");
  });

  it("uploads a photo", async function () {
    await loginUser("malcolm", "weak");
    const form = new FormData();
    const samplePath = path.resolve(__dirname, "..", "images", "malcolm1.jpg");
    form.append("uploadedphoto", fs.createReadStream(samplePath));
    const response = await axios.post(`${baseUrl}/photos/new`, form, {
      headers: { ...form.getHeaders(), Cookie: sessionCookie },
    });
    assert.strictEqual(response.status, 200);
    assert(response.data.file_name.startsWith("U"));

    const newFile = path.resolve(__dirname, "..", "images", response.data.file_name);
    if (fs.existsSync(newFile)) {
      fs.unlinkSync(newFile);
    }
  });

  it("logs out and blocks access", function (done) {
    const options = {
      hostname: host,
      port: port,
      path: "/admin/logout",
      method: "POST",
      headers: { Cookie: sessionCookie },
    };
    const req = http.request(options, function (response) {
      assert.strictEqual(response.statusCode, 200);
      http.get(
        {
          hostname: host,
          port: port,
          path: "/user/list",
        },
        function (res) {
          assert.strictEqual(res.statusCode, 401);
          done();
        }
      );
    });
    req.on("error", done);
    req.end();
  });
});
