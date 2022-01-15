const { Worker } = require("worker_threads");

let workDir = __dirname + "/dbWorker.js";

const axios = require("axios");
const cheerio = require("cheerio");
process.env.TZ = "Indochina Time";
const mainFunc = async (id) => {
  const url = `https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/645?id=${pad(
    id,
    5
  )}&nocatche=1`;
  // fetch html data from iban website
  let res = await fetchData(url);
  if (!res.data) {
    console.log("Invalid data Obj");
    return;
  }
  const html = res.data;
  let dataObj = {
    id: id,
  };

  // mount html page to the root element
  const $ = cheerio.load(html);
  // select table classes, all table rows inside table body
  const divLeft = $("#divLeftContent");
  var numbers = [];
  divLeft.find(".day_so_ket_qua_v2 span").each(function () {
    numbers.push(Number.parseInt($(this).text()));
  });
  var date = divLeft
    .find(".chitietketqua_title h5 b:last-child")
    .text()
    .split("/");
  dataObj["numbers"] = numbers;
  dataObj["date"] = new Date(`${date[2]}/${date[1]}/${date[0]}`);
  dataObj["total"] = $("#divRightContent .so_tien h3")
    .text()
    .replaceAll(".", "");
  dataObj["bingo"] =
    Number.parseInt(
      $("#divRightContent table.table tr").eq(1).find("td").eq(2).text()
    ) > 0
      ? true
      : false;
  return dataObj;
};
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
function timer(ms) { return new Promise(res => setTimeout(res, ms)); }
async function main () {
    let j = 0;
    for (let index = 824; index <= 836; index++) {
        j++;
        if (j == 10) {
            await timer(5000);
            j = 0;
        }
        mainFunc(index).then((res) => {
          console.log(res);
          // start worker
          const worker = new Worker(workDir);
          console.log("Sending crawled data to dbWorker...");
          // send formatted data to worker thread
          worker.postMessage(res);
      
          // listen to message from worker thread
          worker.on("message", (message) => {
            console.log(message);
          });
        });
      }
      console.log("Done");
}

main();



function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}
async function fetchData(url) {
  console.log("Crawling data...");

  // make http call to url
  let response = await axios(url).catch((err) => console.log(err));

  if (response.status !== 200) {
    console.log("Error occurred while fetching data");
    return;
  }
  return response;
}
