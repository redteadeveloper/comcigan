const http = require("http")
const got = require('got')
const euckr = require("../modules/euckrEncode.js")

async function getSchoolSearchKey() {
    const result = await got("http://comci.kr:4082/st")
    const str = result.body.toString().match(/(function school_ra\(sc\)\{\$\.ajax\(\{ url:'\.\/)[0-9]+\?[0-9]+[a-z]\'\+sc\,/).toString()
    return (str.replace("function school_ra(sc){$.ajax({ url:'./", "").replace("'+sc,,function school_ra(sc){$.ajax({ url:'./", ""))
}

async function getTimeTableSearchKey() {
    const result = await got("http://comci.kr:4082/st")
    const str1 = result.body.toString().match(/(var s7=sc\+sc2;var sc3='\.\/)([0-9]+)\?(\'\+btoa\(s7\+\'_\'\+da1\+'_'\+r\))/g)[0]
    const str2 = result.body.toString().match(/(\('#scnm'\)\.empty\(\)\.append\(scnm\);sc_data\(')([0-9]+_)(',sc,1,'0'\);}function)/g)[0]
    const key1 = str1.replace("var s7=sc+sc2;var sc3='./", "").replace("?'+btoa(s7+'_'+da1+'_'+r)", "")
    const key2 = str2.replace("('#scnm').empty().append(scnm);sc_data('", "").replace("_',sc,1,'0');}function", "")
    return ([key1, key2])
}

module.exports = function (app) {
    app.get('/', (req, res) => {
        res.send("Comcigan API by RedTea")
    })

    // School Search
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

    // Timetable Search
    app.get('/timetable-search', async (req, res) => {
        res.contentType("json")

        const id = req.query.id?.toString() ?? ""
        const grade = req.query.grade?.toString() ?? ""
        const clas = req.query.class?.toString() ?? ""

        const keys = await getTimeTableSearchKey()
        const request_path = `/${keys[0]}?${Buffer.from(keys[1] + "_" + id + "_0_1").toString("base64")}`
        const data = await got("http://comci.kr:4082" + request_path)
        const content = JSON.parse(data.body.substr(0, data.body.lastIndexOf('}') + 1))

        if(Object.keys(content).length == 0 || !content.자료481 || !content.자료481[grade] || !content.자료481[grade][clas]) {
            res.write(JSON.stringify([]))
            res.send()
            return
        }

        const original = content.자료481[grade][clas]
        const recent = content.자료147[grade][clas]
        const teacherList = content.자료446
        const classNameList = content.자료492
        const weekList = content.일자자료

        console.log(weekList)
        let response = []

        for(let weekIndex = 0; weekIndex < weekList.length; weekIndex++) {
            let result = {date: weekList[weekIndex][1], table: [5]}

            for (let date = 1; date <= 5; date++) {
                let dateTimetable = [recent[date][0]]
    
                for (let period = 1; period <= 8; period++) {
                    if (!recent[date][period]) {
                        dateTimetable.push(null)
                        continue
                    }
    
                    const changed = (original[date][period] == recent[date][period])
                    const teacher = teacherList[Math.floor(recent[date][period] / 100)].substr(0, 2).replace(/　/g, "") + "*"
                    const className = classNameList[recent[date][period] - Math.floor(recent[date][period] / 100) * 100]
    
                    dateTimetable.push({
                        className: className,
                        teacher: teacher,
                        changed: changed
                    })
                }
                result.table.push(dateTimetable)
            }

            console.log(result)
            response.push(result)
        }

        res.write(JSON.stringify(response))
        res.send()
    })
}