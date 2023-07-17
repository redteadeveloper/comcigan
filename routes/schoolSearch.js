const http = require("http")
const got = require('got')
const euckr = require("../modules/euckrEncode.js")

async function getSchoolSearchKey() {
    const result = await got("http://comci.kr:4082/st")
    const str = result.body.toString().match(/(function school_ra\(sc\)\{\$\.ajax\(\{ url:'\.\/)[0-9]+\?[0-9]+[a-z]\'\+sc\,/).toString()
    return (str.replace("function school_ra(sc){$.ajax({ url:'./", "").replace("'+sc,,function school_ra(sc){$.ajax({ url:'./", ""))
}

module.exports = function (app) {
    app.get("/school-search", async (req, res) => {
        res.contentType("json")

        const school_name = req.query.q?.toString() ?? ""
        const request_path = "/" + await getSchoolSearchKey() + euckr.euckrEncode(school_name)

        http.get(
            {
                host: "comci.kr",
                port: 4082,
                path: request_path,
                method: "GET",
            },
            (api_result) => {
                api_result.on("data", (d) => {
                    res.write(JSON.stringify((JSON.parse(d.toString().replace(/\0/g, "")).학교검색)))
                })
                api_result.on("close", () => {
                    res.send()
                })
            }
        )
    })
}