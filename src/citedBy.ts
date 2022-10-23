import * as fastCsv from "fast-csv";
import * as fs from "fs";

export const getCitetations = () => {
  fs.createReadStream("metadata_C.csv")
    .pipe(fastCsv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => console.log(row))
    .on("end", (rowCount: any) => console.log(`Parsed ${rowCount} rows`));
};
