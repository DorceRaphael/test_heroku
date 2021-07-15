const app = require("express")();
const PORT = process.env.PORT || 3000;
const request = require("request");
const cheerio = require("cheerio");
const cron = require("node-cron");

// pour faire passer des paramètres dans l'URL (pas sûr)
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());

var promises = [];

// TEST CRON toutes les 6 heures
// cron.schedule("* * */6 * * *", () => {
promises = [];

/*------------------------------------------- SPORTMAG.FR */
promises.push(
  new Promise((resolve, reject) => {
    request(
      "https://www.sportmag.fr/sport-handi",
      function (error, response, body) {
        if (error) {
          reject.send(response.statusCode);
        }
        var articleMain = [];
        var article = [];
        var articleTotal = [];
        var $ = cheerio.load(body);

        $(".edgtf-post-example-item-three-item").each(function (
          index,
          element
        ) {
          articleMain[index] = {};
          articleMain[index]["mainlink"] = $(element)
            .find(".edgtf-post-example-item-three-slide-link")
            .attr("href");
          articleMain[index]["maintitle"] = $(element)
            .find(".edgtf-post-example-item-three-title")
            .text()
            .trim();
          articleMain[index]["mainthumbnail"] = $(element)
            .find("div.edgtf-post-example-item-three-image-inner-holder > img")
            .attr("data-lazy-src");
          articleMain[index]["maindate"] = $(element)
            .find(".edgtf-post-info-date")
            .text()
            .trim();
          articleMain[index]["maindescr"] = $(element)
            .find(".edgtf-post-excerpt")
            .text();
        });
        articleTotal.push(articleMain);

        $(".edgtf-peis-image-holder").each(function (index, element) {
          article[index] = {};
          article[index]["link"] = $(element)
            .find(".edgtf-peis-link")
            .attr("href");
          // SLICE POUR AVOIR LA RESOLUTION MAX
          article[index]["thumbnail"] =
            $(element)
              .find(".attachment-magazinevibe_edge_search_page_image")
              .attr("data-lazy-src")
              .slice(0, -12) +
            $(element)
              .find(".attachment-magazinevibe_edge_search_page_image")
              .attr("data-lazy-src")
              .slice(-4);
        });

        $(".edgtf-peis-content-holder").each(function (index, element) {
          article[index]["title"] = $(element)
            .find(".edgtf-peis-title")
            .text()
            .trim();
          article[index]["date"] = $(element)
            .find(".edgtf-post-info-date a span")
            .text();
          article[index]["descr"] = $(element)
            .find(".edgtf-post-excerpt")
            .text();
        });
        articleTotal.push(article);

        return resolve(articleTotal);
      }
    );
  })
);

/*------------------------------------------- PARALYMPIC.ORG */
promises.push(
  new Promise((resolve, reject) => {
    request(
      "https://www.paralympic.org/goalball/news",
      function (error, response, body) {
        if (error) {
          reject.send(response.statusCode);
        }
        var article = [];
        var $ = cheerio.load(body);
        $("div.view-content > div > div > article").each(function (
          index,
          element
        ) {
          article[index] = {};
          article[index]["link"] = $(element)
            .find("article > div > a")
            .attr("href");
          article[index]["title"] = $(element).find("h2 > span > div").text();
          article[index]["thumbnail"] =
            "https://www.paralympic.org" +
            $(element)
              .find("article > div > div.field__item > img")
              .attr("data-src");
        });

        return resolve(article);
      }
    );
  })
);

/*------------------------------------------- HANDISPORT */
promises.push(
  new Promise((resolve, reject) => {
    request(
      "https://www.handisport.org/category/expertise/",
      function (error, response, body) {
        if (error) {
          reject.send(response.statusCode);
        }
        let article = [];
        let $ = cheerio.load(body);
        $(".col-md-4")
          .slice(0, 4)
          .each(function (index, element) {
            article[index] = {};
            article[index]["link"] = $(element).find("a").attr("href");
            article[index]["title"] = $(element).find("h2").text().trim();
            article[index]["thumbnail"] =
              $(element)
                .find("a > div")
                .attr("style")
                .replace("background:url('", "")
                .replace("') no-repeat", "")
                .slice(0, -12) +
              $(element)
                .find("a > div")
                .attr("style")
                .replace("background:url('", "")
                .replace("') no-repeat", "")
                .slice(-4);

            article[index]["date"] = $(element)
              .find(".date-actu")
              .text()
              .trim();

            article[index]["descr"] = $(element)
              .find("div.arch")
              .text()
              .replace(/\s\s+/g, "")
              .trim();
          });

        return resolve(article);
      }
    );
  })
);
// });

/*------------------------------------------- REPONSE */
app.get("/", (req, res) => {
  Promise.all(promises)
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.log(error);
    });
});

/*------------------------------------------- Test parametre dans l'url */
// app.get("/:postId", (req, res) => {
//   Promise.all(promises).then(function (results) {
//     res.json(results)[0].filter((element) => element.date == "21 Mai 2021");
//   });
// });

app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`));
