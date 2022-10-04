const app = require("express")()
const puppeteer = require("puppeteer")
const {accessSync, constants} = require("node:fs")

const PORT = process.env.PORT || 3000
const URL = process.env.URL || "https://www.github.com/ebdonato"

const SCREENSHOT_PATH = "screenshot.png"

async function printScreen() {
    console.log("Obtendo screenshot...")

    let browser = null

    try {
        browser = await puppeteer.launch({args: ["--no-sandbox"]})
        const page = await browser.newPage()
        console.log(`Going to ${URL}`)
        await page.goto(URL, {waitUntil: "networkidle0"})
        await page.screenshot({path: SCREENSHOT_PATH})
        console.log("File saved")
    } catch (error) {
        throw error
    }

    if (browser) {
        browser.close()
    }

    return "New screenshot saved"
}

async function send() {}

app.get("/print", (request, response) => {
    console.log("Take screenshot")

    printScreen()
        .then((message) => {
            response.send({message})
        })
        .catch((error) => {
            console.error(error.message)
            response.status(500).send({error: "Something goes wrong!", details: error.message})
        })
})

app.get("/", (request, response) => {
    console.log("Send screenshot")

    try {
        accessSync(SCREENSHOT_PATH, constants.F_OK)
        response.sendFile(SCREENSHOT_PATH, {root: __dirname})
        return
    } catch (error) {
        console.error(error.message)
    }

    printScreen()
        .then(() => {
            response.sendFile(SCREENSHOT_PATH, {root: __dirname})
        })
        .catch((error) => {
            console.error(error.message)
            response.status(500).send({error: "Something goes wrong!", details: error.message})
        })
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Current version: ${process.env.npm_package_version}`)
    console.log(`Express listening at port: ${PORT}`)
})
