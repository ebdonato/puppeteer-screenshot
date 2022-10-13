require("dotenv-defaults").config()
const { version } = require("./package.json")
const app = require("express")()
const puppeteer = require("puppeteer")
const cron = require("node-cron")
const { accessSync, constants } = require("node:fs")

const PORT = process.env.PORT
const URL = process.env.URL
const EXECUTABLE_PATH = process.env.EXECUTABLE_PATH

const SCREENSHOT_PATH = "screenshot.png"

const logger = {
    log(...message) {
        console.log(new Date().toString(), ...message)
    },
    error(...message) {
        console.error(new Date().toString(), ...message)
    },
}

const puppeteerConfig = { args: ["--no-sandbox"] }

if (EXECUTABLE_PATH) {
    Object.assign(puppeteerConfig, {
        executablePath: EXECUTABLE_PATH,
    })
}

async function printScreen() {
    logger.log("Obtendo screenshot...")

    let browser = null

    const TIMEOUT = 300 * 1000

    try {
        browser = await puppeteer.launch(puppeteerConfig)
        const page = await browser.newPage()
        page.setDefaultNavigationTimeout(TIMEOUT)
        logger.log(`Going to ${URL}`)
        await page.goto(URL, { waitUntil: "networkidle0" })
        await page.screenshot({ path: SCREENSHOT_PATH })
        logger.log("File saved")
    } catch (error) {
        throw error
    }

    if (browser) {
        browser.close()
    }

    return "New screenshot saved"
}

app.get("/health", (request, response) => {
    response.send({
        message: "It's is running!",
    })
})

app.get("/print", (request, response) => {
    logger.log("Take screenshot")

    printScreen()
        .then((message) => {
            response.send({ message })
        })
        .catch((error) => {
            logger.error(error.message)
            response.status(500).send({
                error: "Something goes wrong!",
                details: error.message,
            })
        })
})

app.get("/", (request, response) => {
    logger.log("Send screenshot")

    try {
        accessSync(SCREENSHOT_PATH, constants.F_OK)
        response.sendFile(SCREENSHOT_PATH, { root: __dirname })
        return
    } catch (error) {
        logger.error(error.message)
    }

    printScreen()
        .then(() => {
            response.sendFile(SCREENSHOT_PATH, { root: __dirname })
        })
        .catch((error) => {
            logger.error(error.message)
            response.status(500).send({
                error: "Something goes wrong!",
                details: error.message,
            })
        })
})

const isNaturalNumber = (number) =>
    typeof number === "number" &&
    Number.isFinite(number) &&
    Number.isInteger(number) &&
    number >= 0 &&
    number < 24

const auto_hours = process.env.AUTO_HOURS.split(" ")
    .map((number) => +number)
    .filter(isNaturalNumber)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => a - b)

if (auto_hours.length) {
    logger.log(`Update screenshot at this hour(s):`, auto_hours)

    cron.schedule(`0 0 ${auto_hours.join(",")} * * *`, async () => {
        logger.log("Automatically take screenshot", new Date().toString())
        try {
            await printScreen()
        } catch (error) {
            logger.error(error.message)
        }
    })
}

app.listen(process.env.PORT || PORT, () => {
    logger.log(`Current URL: ${URL}`)
    logger.log(`Current version: ${process.env.npm_package_version || version}`)
    logger.log(`Express listening at port: ${PORT}`)
})
