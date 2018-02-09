// Grab the articles as a json
$.getJSON("/articles", function(data) {
  console.log("data: " , data);
  // For each one
  // for (var i = 0; i < data.length; i++) {
  //   // Display the apropos information on the page
  //   $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");

  // }

  // $('#articles2').empty();
  for (var i = 0; i < 10; i++) {

    // $("#articles2").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");

    // <div class="panel panel-info">
    //   <div class="panel-heading">Panel with panel-info class</div>
    //   <div class="panel-body">Panel Content</div>
    // </div>

    // var newRow = $("<div class='row' id='article-" + data[i]._id + "'>");
    var newRow = $("<div class='row' id='article-" + data[i]._id + "'>");
    var panel = $("<div class='panel panel-info'>");
    var panelHeading = $("<div class='panel-heading'>");
    var panelBody = $("<div class='panel-body'>");
    var storyClass = $("<div class='col-md-7'>");
    var imageClass = $("<div class='col-md-5'>");


    var title = $("<h2>").text(data[i].title);
    var story = $("<p data-id=" + data[i]._id + ">").text(data[i].story);
    var a = $("<a>");
    var linkText = "Click to see article";
    var articleUrl = data[i].link;
    var image = $('<img>');
    image.attr('src', data[i].image);
    image.addClass('img-responsive img-rounded');


    $('#foxArticles').append(newRow);
    newRow.append(panel);
    newRow.append(panelHeading)
    panelHeading.append(title);
   
    
    newRow.append(panelBody);
    newRow.append(storyClass);
    storyClass.append(story);
    // newRow.append(linkText).append(a.attr('href', articleUrl));
    newRow.append(imageClass);
    imageClass.append(image);
  }

});



// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log("DATA: " , data);
      // The title of the article
      $("#notes").append("<h3>" + data.title + "</h3>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


// // When you click the get new articles button
// $(document).on("click", "#scraper", function () {
//   // Grab the id associated with the article from the submit button

//   $.ajax({
//     method: "GET",
//     url: "/scrape/",
//     data: {

//     }
//   })
//     // With that done
//     .done(function (data) {
//       // Log the response
//       console.log(data);
//       console.log("scrape completed");

//     });


// });

// $(document).on("click", "#scraper", function () {
//   // Grab the id associated with the article from the submit button

//   $.ajax({
//     method: "GET",
//     url: "/scrape/",
//     success: function(req, res) {
//       axios.get("http://www.echojs.com/").then(function (response) {
//         var $ = cheerio.load(response.data);

//         // Now, we grab every h2 within an article tag, and do the following:
//         $("article h2").each(function (i, element) {
//           // Save an empty result object
//           var result = {};

//           // Add the text and href of every link, and save them as properties of the result object
//           result.title = $(this)
//             .children("a")
//             .text();
//           result.link = $(this)
//             .children("a")
//             .attr("href");

//           // Create a new Article using the `result` object built from scraping
//           db.Article
//             .create(result)
//             .then(function (dbArticle) {
//               // View the added result in the console
//               console.log(dbArticle);
//             })
//             .catch(function (err) {
//               // If an error occurred, send it to the client
//               return res.json(err);
//             });
//         });


//       });

//     }
//   })
// })