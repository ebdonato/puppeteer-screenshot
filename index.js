const express = require('express')
const puppeteer = require('puppeteer');
const fs = require("fs");

const default_info = {
    screenshotDate: process.env.DEFAULT_DATE || "1981-11-23",
    url: process.env.DEFAULT_URL || "https://www.google.com"
}

let info = fs.existsSync('info.json') ? JSON.parse(fs.readFileSync('info.json')) : default_info

const app = express()
const port = 3000

const screenShotPath = 'screenshot.png'

const printscreen = function (response) {
    let _browser
    let _page
    console.log("Obtendo screenshot...")
    puppeteer
        .launch({ args: ['--no-sandbox'] })
        .then(browser => _browser = browser)
        .then(browser => _page = browser.newPage())
        .then(page => page.goto(info.url, { waitUntil: 'networkidle0' }))
        .then(() => _page)
        .then(page => page.screenshot({ path: screenShotPath }))
        .then(() => {
            info = { screenshotDate: Date.now(), url: info.url }
            fs.writeFileSync('info.json', JSON.stringify(info), err => { if (err) { throw (err) } })
            console.log("Nova screenshot gerada.")
            if (response) {
                console.log("Enviando nova screenshot.")
                response.sendFile(screenShotPath, { root: __dirname })
            }
        })
        .catch(err => {
            console.error(err)
            if (response) {
                response.send("Algo deu errado!")
            }
        })
        .finally(() => {
            if (_browser) {
                _browser.close()
            }
        })
}

function dateDiffInDays(dateBefore, dateAfter) {
    const dt1 = new Date(dateBefore);
    const dt2 = new Date(dateAfter);
    return Math.floor((dt2.getTime() - dt1.getTime()) / (1000 * 3600 * 24))
}

app.get('/hello', (request, response) => {
    //just send hello
    //some endpoint to call to keep it alive
    response.send('hello')
})

app.get('/', (request, response) => {
    const diff = dateDiffInDays(info.screenshotDate, new Date(Date.now()))

    //console.log(request.query)
    if (diff >= 1 || !fs.existsSync(screenShotPath)) {
        printscreen(response)
    } else {
        console.log("Enviando screenshot gerada anteriormente.")
        response.sendFile(screenShotPath, { root: __dirname })
    }
})

//escutando
app.listen(process.env.PORT || port, () => {
    console.log(`Current version: ${process.env.npm_package_version}`)
    console.log(`Express listening at port: ${port}`)
})
