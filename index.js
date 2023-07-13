const express = require("express")
const http = require("http")
const got = require('got')
const euckr = require("./module/euckrEncode.js")

const app = express();
const port = 3000;

async function getSchoolSearchKey() {
    let result = await got("http://comci.kr:4082/st")
    let str = result.body.toString().match(/(function school_ra\(sc\)\{\$\.ajax\(\{ url:'\.\/)[0-9]+\?[0-9]+[a-z]\'\+sc\,/).toString()
    return (str.replace("function school_ra(sc){$.ajax({ url:'./", "").replace("'+sc,,function school_ra(sc){$.ajax({ url:'./", ""))
}

app.get("/", async (req, res) => {
    res.send("Hello World!");
});

app.get("/school-search", async (req, res) => {
    res.contentType("json");
    const school_name = req.query.q?.toString() ?? "";
    new TextEncoder();
    const request_path = "/" + await getSchoolSearchKey() + euckr.euckrEncode(school_name)
    // console.log(request_path);
    http.get(
        {
            host: "comci.kr",
            port: 4082,
            path: request_path,
            method: "GET",
        },
        (api_result) => {
            api_result.on("data", (d) => {
                res.write(JSON.stringify((JSON.parse(d.toString().replace(/\0/g, "")).학교검색)));
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