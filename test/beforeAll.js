var sandbox = sinon.sandbox.create()

before(function (done) {
  corbelTest.common.clients.loginAll().then(function () {
    done()
  }).catch(function (err) {
    done(err)
  })
})

beforeEach(function () {
  sandbox.restore()
})
