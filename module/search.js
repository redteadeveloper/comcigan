const puppeteer = require('puppeteer')

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    })
}

async function search(sc) {

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let inner_html
    let list = []

    await page.goto('http://comci.kr:4082/st');
    await page.type('input[name=sc2]', sc, { delay: 20 })
    await page.click("input[type=button]")

    while (true) {
        await delay(10)
        if ((await page.evaluate(() => document.querySelector('#학교명단검색 > tbody > tr:nth-child(2) > td:nth-child(2) > a')))) break
    }

    inner_html = await page.evaluate(() => document.querySelector('#학교명단검색').innerHTML)

    let schools = inner_html
        .replace("<tbody><tr class=\"검색\"><td>지역</td><td>학교명</td></tr><tr class=\"검색\">", "")
        .match(/<td>.*?<\/td><td><a href="#" onclick="sc_disp\([0-9]*?\)">.*?<\/a><\/td><\/tr>/g)

    schools.forEach(x => {
        let y = x.match(/<td>.*?<\/td>/g)
        if (y[1].match(/\([0-9]*?\)/g)[0].replace("(", "").replace(")", "") != 0) {
            list.push({
                region: y[0].replace("<td>", "").replace("</td>", ""),
                name: y[1].replace(/<td><a href="#" onclick="sc_disp\([0-9]*?\)">/, "").replace("</a></td>", ""),
                id: y[1].match(/\([0-9]*?\)/g)[0].replace("(", "").replace(")", "")
            })
        }
    })

    console.log(list)
    await browser.close()
}

search("휘문")