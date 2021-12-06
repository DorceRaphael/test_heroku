const app = require("express")();
const PORT = process.env.PORT || 3000;
const request = require("request");
const cheerio = require("cheerio");
const cron = require("node-cron");

let promises = [];

function scrap(sport) {
  promises = [];

  /*------------------------------------------- SPORTMAG.FR */
  promises.push(
    new Promise((resolve, reject) => {
      request(
        `https://www.sportmag.fr/?s=handisport+${sport}`,
        function (error, response, body) {
          if (error) {
            reject.send(response.statusCode);
          }
          let article = [];

          try {
            const $ = cheerio.load(body);
            $(".jeg_pl_md_2").each(function (index, element) {
              article[index] = {};
              article[index]["lien"] = $(element).find("h3 a").attr("href");
              article[index]["titre"] = $(element).find("h3 a").text().trim();
              article[index]["thumbnail"] = $(element)
                .find(".wp-post-image")
                .attr("data-src");
              article[index]["date"] = $(element)
                .find(".jeg_meta_date a")
                .text()
                .trim();
              article[index]["description"] = $(element)
                .find(".jeg_post_excerpt p")
                .text();
            });
            return resolve(article);
          } catch (e) {
            return resolve([]);
          }
        }
      );
    })
  );

  /*------------------------------------------- HANDISPORT */
  promises.push(
    new Promise((resolve, reject) => {
      request(
        `https://www.handisport.org/?s=${sport}`,
        function (error, response, body) {
          if (error) {
            reject.send(response.statusCode);
          }
          let article = [];

          try {
            const $ = cheerio.load(body);
            $(".col-md-8 .col-md-4").each(function (index, element) {
              article[index] = {};
              article[index]["lien"] = $(element).find("a").attr("href");
              article[index]["titre"] = $(element).find("h2").text().trim();
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
              article[index]["description"] = $(element)
                .find("div.arch")
                .text()
                .replace(/\s\s+/g, "")
                .trim();
            });

            return resolve(article);
          } catch (e) {
            return resolve([]);
          }
        }
      );
    })
  );
}

// TEST CRON toutes les 6 heures
cron.schedule("* * */6 * * *", () => {
  promises = [];
  scrap(sport);
});

/*------------------------------------------- REPONSE */
app.get("/", (req, res) => {
  scrap("goalball");
  Promise.all(promises)
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/:sport", (req, res) => {
  scrap(req.params.sport);
  Promise.all(promises)
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.log(error);
    });
});
/*------------------------------------------- test filtre */
// app.get("/:sport/:filtre", (req, res) => {
//   scrap(req.params.sport);
//   Promise.all(promises)
//     .then((results) => {
//       let filteredArray = [];
//       for (i = 0; i < results.length; i++) {
//         filteredArray.push(
//           results[i].filter((element) => element.date == req.params.filtre)
//         );
//       }
//       res.json(filteredArray);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`));
