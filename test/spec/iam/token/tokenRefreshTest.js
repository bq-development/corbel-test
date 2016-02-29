describe('In IAM module, token refresh, using correct claims', function () {
  var corbelDriver
  var claimAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT'])
  var clientSecret = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']).clientSecret
  var jwtAlgorithm = corbel.jwt.ALGORITHM
  var tokenValidation = /^.+\..+\..+$/
  var testPrn = 'silkroad-qa@bqreaders.com'
  var version = _.cloneDeep(corbelTest.CONFIG['VERSION'])
  var aud = 'http://iam.bqws.io'
  var domain = 'silkroad-qa'
  var claims = {
    'iss': claimAdmin.clientId,
    'request_domain': domain,
    'scope': 'iam:user:create',
    'aud': aud,
    'version': version,
    'prn': testPrn
  }

  before(function () {
    corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone()
  })

  it('should successes using refresh token to get an access token', function (done) {
    corbelDriver.iam.token()
      .create({
        jwt: corbel.jwt.generate(
          claims,
          clientSecret,
          jwtAlgorithm
        )
      })
      .should.be.eventually.fulfilled
      .then(function (response) {
        var token = response.data
        return corbelDriver.iam.token()
          .refresh(token.refreshToken, 'iam:user:create')
          .should.be.eventually.fulfilled
      })
      .then(function (token) {
        expect(token).to.have.deep.property('data.refreshToken').to.match(tokenValidation)
        expect(token).to.have.deep.property('data.accessToken').and.to.match(tokenValidation)
      })
      .should.notify(done)
  })

  it('should successes an invalid refresh token it is unauthorized (401)', function (done) {
    corbelDriver.iam.token()
      .create({
        jwt: corbel.jwt.generate(
          claims,
          clientSecret,
          jwtAlgorithm
        )
      })
      .should.be.eventually.fulfilled
      .then(function () {
        return corbelDriver.iam.token()
          .refresh('bad_refresh_token', 'iam:user:create')
          .should.be.eventually.rejected
      })
      .then(function (e) {
        expect(e).to.have.property('status', 401)
        expect(e).to.have.deep.property('data.error', 'unauthorized')
      })
      .should.notify(done)
  })
})
