const app = require("express")();
const PORT = process.env.PORT || 3000;
const request = require("request");
const cheerio = require("cheerio");
const cron = require("node-cron");

// TEST CRON
// cron.schedule("*/5 * * * * *", () => {
//   console.log("test");
// });

// TEST REST API
app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`));

app.get("/test", (req, res) =>
  request(
    "https://www.sportmag.fr/sport-handi",
    function (error, response, body) {
      if (error) {
        res.send(response.statusCode);
      }
      var article = [];
      var $ = cheerio.load(body);
      $(".edgtf-peis-image-holder").each(function (index, element) {
        article[index] = {};
        article[index]["img"] = $(element)
          .find(".edgtf-peis-link")
          .attr("href");
      });

      $(".edgtf-peis-content-holder").each(function (index, element) {
        article[index]["titre"] = $(element)
          .find(".edgtf-peis-title")
          .text()
          .trim();
        article[index]["auteur"] = $(element)
          .find(".edgtf-post-info-author-link")
          .attr("href");
        article[index]["date"] = $(element)
          .find(".edgtf-post-info-date a span")
          .text();
        article[index]["descr"] = $(element).find(".edgtf-post-excerpt").text();
      });

      res.json(article);
    }
  )
);
