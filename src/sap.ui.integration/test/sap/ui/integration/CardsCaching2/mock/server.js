/* eslint-disable */

var http = require('http'),
    UrlModule = require('url'),
    URL = UrlModule.URL,
    fs = require('fs');

console.log("Mock server started at http://localhost:8090/");

http.createServer(function (req, res) {
    var reqUrl = new URL(req.url, "http://localhost:8090/"),
        file = reqUrl.searchParams.get("file"),
        delay = Math.floor(Math.random() * 30) * 100 + 1000;

    console.log("Serve " + file + " with delay " + delay + "ms");

    setTimeout(function () {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*", // to allow Prefer
            "Access-Control-Expose-Headers": "*",
            "Content-Type": "application/json",
            "Date": new Date()
        });

        if (file) {
            var data = JSON.parse(fs.readFileSync(file));

            if (file === "data1.json" || file === "data4.json") {
                // simulate modified data
                data = getRandom(data, Math.floor(Math.random() * 4) + 1);
            }

            res.write(JSON.stringify(data));
        }

        res.end();
    }, delay);
}).listen(8090);

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);

    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}