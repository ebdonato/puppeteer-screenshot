const base64json = require("base64json")

const assert = require('assert');

const data = require('./serviceAccountKey.json')

const encoded = base64json.stringify(data)

assert.strictEqual(base64json.stringify(data), encoded)
assert.deepStrictEqual(base64json.parse(encoded), data)

console.log('✓ All tests passed!');
console.log(encoded)
