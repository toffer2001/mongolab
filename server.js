var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require("mongojs");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));



// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongo-lab";

// // Set mongoose to leverage built in JavaScript ES6 Promises
// // Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Database configuration
// Save the URL of our database as well as the name of our collection
var databaseUrl = "mongo-lab";
var collections = ["articles"];

// Use mongojs to hook the database to the db variable
var mongojs = mongojs(databaseUrl, collections);


app.get("/clear", function (req, res) {
  // Query: In our database, go to the animals collection, then "find" everything
  mongojs.articles.remove({})
     res.redirect('/');

});

// Routes

// A GET route for scraping the  website
// app.get("/scrape", function(req, res) {
// console.log("begin scrape");
//   // axios.get("http://www.echojs.com/").then(function(response) {
//   //   var $ = cheerio.load(response.data);
//   // var result = {};
//     request("http://www.foxnews.com/us.html", function (error, response, html) {
//       var $ = cheerio.load(html);


//       var results = [];


//       $("article").each(function (i, element) {

//         // var imgLink = $(element).find("source").find("img").attr("data-default-src").split(",")[0].split(" ")[0];


//         var title = $(element).children().find('.title').text();
//         var title2 = title.replace(/[\n\t\t\t\t\t\t\t\t\t]/ig, '');


//         var link = $(element).children().children().attr("href");
//         var story = $(element).find(".dek").children("a").text();
        
//         results.push({
//           title: title2,
//           link: link,
//           story: story

//         });


//       console.log("results: " , results);

//       res.json(results);

//     // $("article h2").each(function(i, element) {
//     //   var result = {};

//     //   // Add the text and href of every link, and save them as properties of the result object
//     //   result.title = $(this)
//     //     .children("a")
//     //     .text();
//     //   result.link = $(this)
//     //     .children("a")
//     //     .attr("href");

//       // Create a new Article using the `result` object built from scraping
//       // db.Article
//       //   .create(results)
//       //   .then(function(dbArticle) {
//       //     // If we were able to successfully scrape and save an Article, send a message to the client
//       //     res.send("Scrape Complete");
//       //   })
//       //   .catch(function(err) {
//       //     // If an error occurred, send it to the client
//       //     res.json(err);
//       //   });
//     });
//   });
// });


app.get("/scrape", function (req, res) {
  console.log("begin scrape");
  axios.get("http://www.foxnews.com/us.html").then(function(response) {
    var $ = cheerio.load(response.data);
  var result = {};



    // $("article").each(function (i, element) {

    //   var title = $(element).children().find('.title').text();
    //   var title2 = title.replace(/[\n\t\t\t\t\t\t\t\t\t]/ig, '');


    //   var link = $(element).children().children().attr("href");
    //   var story = $(element).find(".dek").children("a").text();

    //   results.push({
    //     title: title2,
    //     link: link,
    //     story: story

    //   });


    //   console.log("results: ", results);

    //   res.json(results);

      $("article").each(function(i, element) {
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).children().find('.title').text().replace(/[\n\t\t\t\t\t\t\t\t\t]/ig, '');
        result.link = $(this).children().children().attr("href");
        result.story = $(this).find(".dek").children("a").text();
        result.image = $(element).find(".m").children("a").children("img").attr("src");

      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
          
        });
    });
  });
  res.redirect('/');
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
