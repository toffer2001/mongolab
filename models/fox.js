

var cheerio = require("cheerio");
var request = require("request");

request("http://www.foxnews.com/us.html", function (error, response, html) {
    var $ = cheerio.load(html);

    var results = [];


    $("article").each(function (i, element) {

        // var imgLink = $(element).find("source").find("img").attr("data-default-src").split(",")[0].split(" ")[0];


        var title = $(element).children().find('.title').text();
        var title2 = title.replace(/[\n\t\t\t\t\t\t\t\t\t]/ig, '');


        var link = $(element).children().children().attr("href");
        // var story = $(element).children(".info").children(".content").children(".dek").children("a").text();

        var story = $(element).find(".dek").children("a").text();
        var image = $(element).find(".m").children("a").children("img").attr("src");

        results.push({
            title: title2,
            link: link,
            story: story,
            image: image
        });
    });


    console.log(results);
});
