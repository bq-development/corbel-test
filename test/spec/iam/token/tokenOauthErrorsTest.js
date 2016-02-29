describe('In IAM module, When try to get token with', function () {
  var testDriver = corbelTest.getCustomDriver()

  var jwtAlgorithm = 'HS256'
  var aud = 'http://iam.bqws.io'
  var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT'])
  var socialOauths = ['facebook', 'google', 'silkroad']
  var domain = 'silkroad-qa'
  var url1 = window.location.host.split(':')[0]
  var url2 = (parseInt(window.location.host.split(':')[1]) + 1) // eslint-disable-line
  var requestInfoEndpoint = 'http://' + url1 + ':' + url2 + '/requestinfo'
  var version = _.cloneDeep(corbelTest.CONFIG['VERSION'])

  socialOauths.forEach(function (socialOauth) {
    it('bad token in ' + socialOauth, function (done) {
      var accessToken = 'badToken'

      var claims = {
        'iss': claimDefault.clientId,
        'request_domain': domain,
        'scope': claimDefault.scopes,
        'aud': aud,
        'version': version,
        'oauth.service': socialOauth,
        'oauth.access_token': accessToken
      }

      testDriver.iam.token()
        .create({
          jwt: corbel.jwt.generate(
            claims,
            claimDefault.clientSecret,
            jwtAlgorithm
          )
        })
        .should.be.eventually.rejected
        .then(function (response) {
          var error = response.data
          expect(response).to.have.property('status', 401)
          expect(error).to.have.property('error', 'unauthorized')
        })
        .should.be.eventually.fulfilled.notify(done)
    })

    it('bad code in ' + socialOauth, function (done) {
      var code = 'badCode'

      var claims = {
        'iss': claimDefault.clientId,
        'request_domain': domain,
        'scope': claimDefault.scopes,
        'aud': aud,
        'version': version,
        'oauth.code': code,
        'oauth.service': socialOauth,
        'oauth.redirect_uri': requestInfoEndpoint
      }

      testDriver.iam.token()
        .create({
          jwt: corbel.jwt.generate(
            claims,
            claimDefault.clientSecret,
            jwtAlgorithm
          )
        })
        .should.be.eventually.rejected
        .then(function (response) {
          var error = response.data
          expect(response).to.have.property('status', 401)
          expect(error).to.have.property('error', 'unauthorized')
        })
        .should.be.eventually.fulfilled.notify(done)
    })

    it('missing oauth params in ' + socialOauth, function (done) {
      var claims = {
        'iss': claimDefault.clientId,
        'request_domain': domain,
        'scope': claimDefault.scopes,
        'aud': aud,
        'version': version,
        'oauth.service': socialOauth,
        'oauth.redirect_uri': requestInfoEndpoint
      }

      testDriver.iam.token()
        .create({
          jwt: corbel.jwt.generate(
            claims,
            claimDefault.clientSecret,
            jwtAlgorithm
          )
        })
        .should.be.eventually.rejected
        .then(function (response) {
          var error = response.data
          expect(response).to.have.property('status', 400)
          expect(error).to.have.property('error', 'missing_oauth_params')
        })
        .should.be.eventually.fulfilled.notify(done)
    })
  })
})
