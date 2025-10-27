var Promise = require("Promise");

/**
 * FetchModel - Fetch a model from the web server.
 *     url - string - The URL to issue the GET request.
 * Returns: a Promise that should be filled
 * with the response of the GET request parsed
 * as a JSON object and returned in the property
 * named "data" of an object.
 * If the requests has an error the promise should be
 * rejected with an object contain the properties:
 *    status:  The HTTP response status
 *    statusText:  The statusText from the xhr request
 *
*/

function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    console.log(url);

    let xhr = new XMLHttpRequest();

    xhr.open("GET", url);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          let responseObject = JSON.parse(xhr.responseText);
          resolve({ data: responseObject });
        } catch (e) {
          reject({
            status: xhr.status,
            statusText: "Invalid JSON response: " + e.message,
          });
        }
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      }
    };

    xhr.onerror = function () {
      reject({
        status: xhr.status,
        statusText: xhr.statusText || "Network Error",
      });
    };

    xhr.send();
  });
}

export default fetchModel;