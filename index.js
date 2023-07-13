const express = require("express")
const http = require("http")
const euckr = require("./module/euckrEncode.js")

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/search", (req, res) => {
    res.contentType("json");
    const school_name = req.query.school?.toString() ?? "";
    new TextEncoder();
    const request_path = "/36179?17384l" + euckr.euckrEncode(school_name)
    console.log(request_path);
    http.get(
        {
            host: "comci.kr",
            port: 4082,
            path: request_path,
            method: "GET",
        },
        (api_result) => {
            api_result.on("data", (d) => {
                res.write(d.toString().replace(/\0/g, ""));
            });
            api_result.on("close", () => {
                res.send();
            });
        }
    );
});

app.listen(port, () => {
    console.log("Hello World!");
})