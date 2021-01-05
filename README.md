# puppeteer-screenshot

## Goal

The goal is generate a screenshot of some web site to be embed some place else.

## Heroku

Running Puppeteer on Heroku requires some additional dependencies that aren't included on the Linux box that Heroku spins up for you. To add the dependencies on deploy, add the Puppeteer Heroku buildpack to the list of buildpacks for your app under Settings > Buildpacks.

The url for the buildpack is https://github.com/jontewks/puppeteer-heroku-buildpack

[Reference](https://stackoverflow.com/questions/63177218/puppeteer-on-heroku-failed-to-launch-the-browser-process)

## Firebase Rule

Only Firebase admin can access the server previously saved information:

``` json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
