# puppeteer-screenshot

## Goal

The goal is generate a screenshot of some web site to be embed some place else.

## Routes

### Screenshot

> GET /

Get the current saved screenshot

### Print

> GET /print

Take a screenshot and save it

## Configuration

Configuration by environment variables:

| Variable       | Meaning                              | Default                           |
| -------------- | ------------------------------------ | --------------------------------- |
| PORT           | Outgoing application port            | 3000                              |
| URL            | Webpage to screenshot                | <https://www.github.com/ebdonato> |
| AUTO_HOURS[^1] | Hours of day to renew the screenshot | 9 21                              |

[^1]: Only natural integer number equal or greater then 0 and lower than 24
