import puppeteer from "puppeteer";
import { createConnection } from "typeorm";
import { Papers } from "./entity/paper";
import axios from "axios";
import cheerio from "cheerio";
import { getRepository } from "typeorm";
import { getCitetations } from "./citedBy";

const searchTerms = [
  //   // "database+joins",
  //   // "Hashing+techniques+cpu",
  //   // "Hashing+techniques+on+single+core+cpu",
  //   // "join+algorithms+sql",
  //   // "hash+join+algorithm",
  //   // "Hashing+techniques",
  //   // "hashing+algorithms",
  //   // "Relational+database+Join",
  //   // "Hash+Join",
  //   // "general+hashing+techniques+join+relational",
  //   // "hash+techniques+dbms",
  //   // "hash+dbms",
  //   // "relational+join",
  //   // "join+extensions",
  //   // "relational+join+dbms",
  //   // "join+algorithms",
  //   // "relation+join+extension",
  //   // "relational+join+algorithm",
  //   // "nested+loop+join",
  //   // "nested+loop+join+algorithm",
  //   // "block+nested+loop+join+algorithm",
  //   // "block+nested+loop+join",
  //   // "sort+merge+join+algorithm",
  //   // "sort+merge+join",
  //   // "database+join+algorithms",

  "collaborative+learning",
];

const keyWords = [
  //   "Relational Join ",
  //   "Hashing techniques cpu",
  //   "Hashing techniques on single core cpu",
  //   "Hashing techniques ",
  //   "hashing algorithms",
  //   "hash join",
  //   "joins",
  //   "join",
  //   "relational join",
  //   "Relational database",
  //   "hash-join",
  //   "general hashing techniques join relational",
  //   "hash techniques dbms",
  //   "hash dbms",
  //   "data base join",
  //   "relational join",
  //   "join extensions",
  //   "relational join dbms",
  //   "relational join techniques",
  //   "join algorithm",
  //   "join algorithms",
  //   "relational join algorithm",
  //   "relation join extension",
  //   // "dbms",
  //   "nested loop",
  //   "nested-loop-join",
  //   "nested loop join",
  //   "index nested loop join",
  //   "nested loop join algorithm",
  //   "block-nested-loop",
  //   "block nested loop",
  //   "block nested loop join",
  //   "block nested loop join algorithm",
  //   "sort merge",
  //   "sort merge join",
  //   "sort-merge-join",
  //   "sort merge join algorithm",
  //   "merge join",
  //   // "database",
  //   // "databases",
  //   "join algorithm",
  //   "join algorithms",
  //   "rdbms join",
  //   "rdbms joins",
  //   "rdbms join algorithms",
  //   // "cpu",
  //   // "gpu",

  "collaboration",
  "collaborative learning",
  "computer science",
  "software engineering",
  "collaboration predictors",
  "team effectiveness",
  "women",
  "work groups",
  "collaborative research",
  "systematic literature review",
];

const main = () => {
  createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "xyz13!#XYZ",
    database: "research",
    entities: [Papers],
    synchronize: true,
    logging: false,
  });
  savePapersData();
  // getCitetations();
};

const savePapersData = async () => {
  searchTerms.forEach(async (srhtrm) => {
    const response = axios.get(
      "https://dblp.org/search/publ/api?q=" +
        srhtrm +
        "&h=3200&f=4000&format=json"
    );

    var newData = (await response).data.result.hits.hit;
    var sDirect = false;
    console.log("https://dblp.org/search/publ/api?q=" + srhtrm);
    for (let index = 0; index < newData?.length; index++) {
      const element = newData[index];
      const author: string[] = [];
      if (element.info.year >= 2009) {
        if (element.info.doi) {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          try {
            await page.goto("https://doi.org/" + element.info.doi);
            page.waitForTimeout(5000);
            const content = await page.content();
            const $ = cheerio.load(content);
            var matches = keyWords.filter((keyWord) =>
              $.text().toLowerCase().includes(keyWord)
            );
          } catch (error) {
            var matches: string[] = [];
            sDirect = true;
          }
          browser.close();
          if (matches.length) {
            const check = "";
            saveToDatabase(element, check);
          } else if (sDirect) {
            scienceDirect(element);
          }
          browser.close();
        } else if (
          element.info.ee &&
          !element.info.ee.toLowerCase().includes("pdf") &&
          !sDirect
        ) {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          try {
            await page.goto(element.info.ee);
            page.waitForTimeout(6000);
            const content = await page.content();
            const $ = cheerio.load(content);
            var matches = keyWords.filter((keyWord) =>
              $.text().toLowerCase().includes(keyWord)
            );
          } catch (error) {
            var matches: string[] = [];
            sDirect = true;
          }
          browser.close();
          if (matches.length) {
            const check = "";
            saveToDatabase(element, check);
          } else if (sDirect) {
            scienceDirect(element);
          }
          browser.close();
        } else {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();

          try {
            await page.goto("https://scholar.google.com/");
            await page.waitForSelector('input[aria-label="Search"]', {
              visible: true,
            });
            await page.type(
              'input[aria-label="Search"]',
              // " Parallel sort-merge object-oriented collection join algorithms."
              element.info.title
            );
            await Promise.all([
              page.waitForNavigation(),
              page.keyboard.press("Enter"),
            ]);

            await page.waitForSelector(".gs_rt", { visible: true });
            const content = await page.content();
            const $ = cheerio.load(content);
            let firstElem = $(".gs_rt a[href]").get()[0];
            const href = $(firstElem).attr("href");
            browser.close();

            if (!$(firstElem)?.attr("href")?.toLowerCase().includes("pdf")) {
              const browser = await puppeteer.launch();
              const page = await browser.newPage();
              try {
                href && (await page.goto(href));
                page.waitForTimeout(5000);
                const content = await page.content();
                const $ = cheerio.load(content);
                var matches = keyWords.filter((keyWord) =>
                  $.text().toLowerCase().includes(keyWord)
                );
              } catch (error) {
                var matches: string[] = [];
                sDirect = true;
              }

              browser.close();

              if (matches.length) {
                const check = "";
                saveToDatabase(element, check);
              } else if (sDirect) {
                const check = "Manual Check";
                saveToDatabase(element, check);
              }
            } else {
              const check = "Manual Check";
              saveToDatabase(element, check);
            }
          } catch (error) {}
        }
      }
    }
  });
};

const scienceDirect = async (element: any) => {
  const author: string[] = [];
  let check = "";
  let doi = "";
  if (element.info.doi) {
    doi = element.info.doi;
  } else {
    doi = element.info.ee.replace("https://doi.org", "");
  }

  try {
    const scienceDirectResponse = await axios.get(
      "https://api.elsevier.com/content/article/doi/" +
        doi +
        "?httpAccept=application/json&apiKey=4077a192e53f9b2705fa56882858f314"
    );
    const data = scienceDirectResponse.data["full-text-retrieval-response"];
    var matches = keyWords.filter((keyWord) =>
      data.originalText.toLowerCase().includes(keyWord)
    );
  } catch (error) {
    var matches: string[] = ["t"];
    check = "Manual Check";
  }

  if (matches.length) {
    saveToDatabase(element, check);
  }
  matches = [];
};

const saveToDatabase = async (element: any, check: string) => {
  const author: string[] = [];
  const authors = element.info.authors?.author;
  let authorsJoined = "";
  if (Array.isArray(authors)) {
    authors.forEach(function (value: any) {
      author.push(value.text);
    });
    authorsJoined = author.join(",");
  } else {
    authorsJoined = authors?.text;
  }

  var obj = {
    title: element.info.title,
    authors: authorsJoined,
    venue: Array.isArray(element.info.venue)
      ? element.info.venue.join(",")
      : element.info.venue,
    doi: element.info.doi,
    publishedYear: element.info.year,
    abstract: check,
  };
  const paper = getRepository(Papers).create(obj);
  await getRepository(Papers).save(paper);
};

main();
