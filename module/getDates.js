const puppeteer = require('puppeteer')

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    })
}

async function getDates(id) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let inner_html
    let list = []

    await page.goto('http://comci.kr:4082/st');
    await page.type('input[name=sc2]', "문", { delay: 20 })
    await page.click("input[type=button]")

    while (true) {
        await delay(10)
        if ((await page.evaluate(() => document.querySelector('#학교명단검색 > tbody > tr:nth-child(2) > td:nth-child(2) > a')))) break
    }

    await page.evaluate((id) => { sc_disp(id) }, id)

    while (true) {
        await delay(10)
        if ((await page.evaluate(() => document.querySelector('#hour > table > tbody')))) break
    }

    inner_html = await page.evaluate(() => document.querySelector('#시간표열람 > table > tbody > tr:nth-child(3) > td:nth-child(2)').innerHTML)

    inner_html.match(/<option value="[0-9]*?"( selected="")?>[0-9-]*? ~ [0-9-]*?<\/option>/g).forEach(x => {
        list.push(x.replace(/<option value="[0-9]*?"( selected="")?>/, "").replace(/<\/option>/, "").replace(/[ \-~]/g, ""))
    })

    console.log(list)
    await browser.close()
}

getDates(54960)