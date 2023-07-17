const got = require('got')

async function getTimeTableSearchKey() {
    let result = await got("http://comci.kr:4082/st")
    let str1 = result.body.toString().match(/(var s7=sc\+sc2;var sc3='\.\/)([0-9]+)\?(\'\+btoa\(s7\+\'_\'\+da1\+'_'\+r\))/g)[0]
    let str2 = result.body.toString().match(/(\('#scnm'\)\.empty\(\)\.append\(scnm\);sc_data\(')([0-9]+_)(',sc,1,'0'\);}function)/g)[0]
    let key1 = str1.replace("var s7=sc+sc2;var sc3='./", "").replace("?'+btoa(s7+'_'+da1+'_'+r)", "")
    let key2 = str2.replace("('#scnm').empty().append(scnm);sc_data('", "").replace("_',sc,1,'0');}function", "")
    return ([key1, key2])
}

exports.getTimeTable = async function (id, grade, clas) {
    const keys = await getTimeTableSearchKey()
    const request_path = `/${keys[0]}?${Buffer.from(keys[1] + "_" + id + "_0_1").toString("base64")}`
    got("http://comci.kr:4082" + request_path).then(res => {
        const content = JSON.parse(res.body.substr(0, res.body.lastIndexOf('}') + 1))

        const original = content.자료481[grade][clas]
        const recent = content.자료147[grade][clas]
        const teacherList = content.자료446
        const classNameList = content.자료492

        let result = [5]

        for(let date = 1; date <= 5; date++) {
            let dateTimetable = [recent[date][0]]

            for(let period = 1; period <= 8; period++) {
                if (!recent[date][period]) {
                    dateTimetable.push(null)
                    continue
                }
                
                const changed = (original[date][period] == recent[date][period])
                const teacher = teacherList[Math.floor(recent[date][period] / 100)].substr(0, 2).replace(/　/g, "") + "*"
                const className = classNameList[recent[date][period] - Math.floor(recent[date][period] / 100)*100]

                dateTimetable.push({
                    className: className,
                    teacher: teacher,
                    changed: changed
                })
            }
            result.push(dateTimetable)
        }

        console.log(result)

    })
}

search(69622, 1, 2)