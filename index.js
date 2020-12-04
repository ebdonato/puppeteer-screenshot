const express = require('express')
const puppeteer = require('puppeteer')
const fs = require("fs")
const firebaseAdmin = require('firebase-admin')
const base64json = require("base64json")

//path to Firebase Admin SDK private Key -> get it at https://console.firebase.google.com/project/em-coordenadas/settings/serviceaccounts/adminsdk
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(base64json.parse(process.env.SERVICE_KEY_BASE64)),
    storageBucket: process.env.FIREBASE_STORAGE_URL
});

const bucket = firebaseAdmin.storage().bucket()

const app = express()
const port = 3000

let info = {}
const screenShotPath = 'screenshot.png'

function setInfoToDefault() {
    info = {
        screenshotDate: 1
    }
}

function printScreen(response) {
    let _browser
    let _page
    console.log("Obtendo screenshot...")
    puppeteer
        .launch({ args: ['--no-sandbox'] })
        .then(browser => _browser = browser)
        .then(browser => _page = browser.newPage())
        .then(page => page.goto(process.env.URL || "https://www.github.com/ebdonato", { waitUntil: 'networkidle0' }))
        .then(() => _page)
        .then(page => page.screenshot({ path: screenShotPath }))
        .then(() => {
            console.log("Nova screenshot gerada.")
            if (response) {
                console.log("Enviando nova screenshot.")
                response.sendFile(screenShotPath, { root: __dirname })
            }

            info = { screenshotDate: Date.now() }
            saveScreenShotToFirebase()
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

function saveScreenShotToFirebase() {
    bucket.upload(screenShotPath, {
        uploadType: 'media',
        metadata: {
            metadata: info
        }

    }, err => {
        if (err) {
            console.log("Erro ao salvar arquivo no Firebase Storage")
        }
    })
}

function loadScreenShotFromFirebase() {
    const firebaseFile = bucket.file(screenShotPath)

    firebaseFile.exists()
        .then(fileExists => {
            if (fileExists[0]) {
                const options = {
                    destination: './' + screenShotPath,
                }

                firebaseFile.download(options)
                    .catch(console.error)

                firebaseFile.getMetadata()
                    .then(data => {
                        info = data[0].metadata
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        }).catch(console.error)
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
    const diff = dateDiffInDays(parseInt(info.screenshotDate), Date.now())

    if (diff >= 1 || !fs.existsSync(screenShotPath)) {
        printScreen(response)
    } else {
        console.log("Enviando screenshot gerada anteriormente.")
        response.sendFile(screenShotPath, { root: __dirname })
    }
})

//escutando
app.listen(process.env.PORT || port, () => {
    setInfoToDefault()
    console.log(`Current version: ${process.env.npm_package_version}`)
    console.log(`Express listening at port: ${port}`)
    loadScreenShotFromFirebase()
})
