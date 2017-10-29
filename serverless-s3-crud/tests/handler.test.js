const Code = require('code')
const expect = Code.expect
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const fetch = require('isomorphic-fetch')
// const handler = require('../handler')


// DECLARE VARIABLES

const IS_PROD = true
const prefix = 'test-'
const host = 'jw6pr5u674.execute-api.us-east-1.amazonaws.com'
const apiEndpoint = IS_PROD
  ? 'https://' + host + '/dev/form-response/'
  : 'http://localhost:3000/form-response/'
const bucket = 'form-response'
const TEST_KEY = 'data-key'
const TEST_DATA = {
  this: 'is',
  a: 'test',
  bool: true,
  num: 5
}
const ACCESS_KEY = process.env['AWS_ACCESS_KEY_ID']
const SECRET_KEY = process.env['AWS_SECRET_ACCESS_KEY']

const headers = {
  "Access-Control-Allow-Origin" : "*",
}


// RUN TESTS
function cleanup(done) {
  fetch(apiEndpoint + prefix + TEST_KEY, {
    headers: headers,
    method: 'DELETE'
  }).then(function(d) {
    done()
  })
}

lab.beforeEach(cleanup)
lab.after(cleanup)

lab.describe('GET request', function() {
  lab.test('returns null if an object does not exist', (done) => {
    fetch(apiEndpoint + prefix + TEST_KEY, {
        headers: headers,
        method: 'GET'
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        expect(data).to.be.null()
        done()
      })
  })

  lab.test('returns an object if it exists', (done) => {
    fetch(apiEndpoint + prefix + TEST_KEY, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(TEST_DATA)
      }).then(function() {
        return fetch(apiEndpoint + prefix + TEST_KEY, {
          headers: headers,
          method: 'GET'
        })
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        expect(data.ETag).to.be.a.string()
        expect(data.LastModified).to.be.a.string()
        expect(data.ContentLength).to.be.a.string()
        expect(data.ContentType).to.be.a.string()

        const body = new Buffer(data.Body, 'binary').toString()
        expect(body).to.be.a.string()

        const obj = JSON.parse(body)
        expect(obj).to.equal(TEST_DATA)
        done()
      })
  })
})

lab.describe('POST request', function() {
  lab.test('updates or creates an object', (done) => {
    fetch(apiEndpoint + prefix + TEST_KEY, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(TEST_DATA)
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        expect(data.ETag).to.be.a.string()
        expect(data.Location).to.contain(bucket + '/' + prefix + TEST_KEY)
        expect(data.key).to.equal(prefix + TEST_KEY)
        expect(data.Key).to.equal(prefix + TEST_KEY)
        expect(data.Bucket).to.equal(bucket)
        done()
      })
  })

  lab.test('cannot create an object when no Body is specified', (done) => {
    fetch(apiEndpoint + prefix, {
        headers: headers,
        method: 'POST'
      }).then(function(res) {
        // expect(res.status).to.equal(200)
        return res.json()
      }).then(function(data) {
        expect(data.message).to.contain('Internal server error')
        // expect(data.errorMessage).to.contain('Uncaught error')
        done()
      })
  })
})

lab.describe('PUT request', function() {
  lab.test('updates or creates an object', (done) => {
    const postfix = '-new'
    fetch(apiEndpoint + prefix + TEST_KEY + postfix, {
        headers: headers,
        method: 'PUT',
        body: JSON.stringify(TEST_DATA)
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        expect(data.ETag).to.be.a.string()
        expect(data.Location).to.contain(bucket + '/' + prefix + TEST_KEY + postfix)
        expect(data.key).to.equal(prefix + TEST_KEY + postfix)
        expect(data.Key).to.equal(prefix + TEST_KEY + postfix)
        expect(data.Bucket).to.equal(bucket)
        done()
      })
  })

  lab.test('cannot update an object when no Body is specified', (done) => {
    fetch(apiEndpoint + prefix, {
        headers: headers,
        method: 'PUT'
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        expect(data.message).to.contain('Internal server error')
        // expect(data.errorMessage).to.contain('Uncaught error')
        done()
      })
  })
})

lab.describe('DELETE request', function() {
  lab.test('deletes an object', (done) => {
    fetch(apiEndpoint + prefix + TEST_KEY, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(TEST_DATA)
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        expect(data.ETag).to.be.a.string()
        expect(data.Location).to.contain(bucket + '/' + prefix + TEST_KEY)
        expect(data.key).to.equal(prefix + TEST_KEY)
        expect(data.Key).to.equal(prefix + TEST_KEY)
        expect(data.Bucket).to.equal(bucket)
        return fetch(apiEndpoint + prefix + TEST_KEY, {
          headers: headers,
          method: 'DELETE',
          body: JSON.stringify(TEST_DATA)
        })
      }).then(function(res) {
        return fetch(apiEndpoint + prefix + TEST_KEY, {
          headers: headers,
          method: 'GET'
        })
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        expect(data).to.be.null()
        done()
      }).catch((e) => console.log(e))
  })

  lab.test('returns a 200 even if the object does not exist', (done) => {
    fetch(apiEndpoint + prefix + 'foo1', {
        headers: headers,
        method: 'DELETE'
      }).then(function(res) {
        expect(res.status).to.equal(200)
        done()
        return res.json()
      })
  })
})
