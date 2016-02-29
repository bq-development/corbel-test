describe('In OAUTH module', function () {
  describe('when request to update user information', function () {
    var corbelDriver
    var oauthCommon
    var oauthAdminUserTest, oauthRootUserTest
    var adminAccessToken
    var accessToken
    var userTest
    var timeStamp

    before(function (done) {
      corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone()
      oauthCommon = corbelTest.common.oauth
      oauthAdminUserTest = oauthCommon.getOauthAdminUserParams()
      oauthRootUserTest = oauthCommon.getOauthRootUserParams()

      oauthCommon.getToken(corbelDriver, oauthAdminUserTest.username, oauthAdminUserTest.password)
        .should.be.eventually.fulfilled
        .then(function (response) {
          adminAccessToken = response.data['access_token']
        })
        .should.notify(done)
    })

    beforeEach(function (done) {
      timeStamp = Date.now()
      userTest = {
        'username': 'updateUserOauthTest' + timeStamp,
        'password': 'passwordTest',
        'email': 'updateUserOauthTes' + timeStamp + '@funkifake.com',
        'properties': {
          'propertyKey1': 'propertyValue1',
          'propertyKey2': 'propertyValue2'
        }
      }

      corbelDriver.oauth
        .user(oauthCommon.getClientParams())
        .create(userTest)
        .should.be.eventually.fulfilled
        .then(function () {
          return oauthCommon
            .getToken(corbelDriver, userTest.username, userTest.password)
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          accessToken = response.data['access_token']
        })
        .should.notify(done)
    })

    afterEach(function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .delete('me')
        .should.be.eventually.fulfilled.should.notify(done)
    })

    it('204 is returned when request update user email', function (done) {
      var updatedEmail = 'updateUserOauthTestUpdated' + timeStamp + '@funkifake.com'
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .update('me', {'email': updatedEmail})
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', updatedEmail.toLowerCase())
        })
        .should.notify(done)
    })

    it('204 is returned when request update user password', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .update('me', {'password': 'passwordTestUpdate'})
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.email', userTest.email.toLowerCase())
        })
        .should.notify(done)
    })

    it('304 is returned when request update user role', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .update('me', {'role': 'ADMIN'})
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 403)
        })
        .should.notify(done)
    })

    it('204 is returned when request update other user email', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .get('me')
        .should.be.eventually.fulfilled
        .then(function (response) {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), adminAccessToken)
            .update(response.data.id, {
              'email': 'createUserOauthTest' + timeStamp + '@funkifake.com'
            })
        })
        .should.be.eventually.fulfilled.should.notify(done)
    })

    it('204 is returned when request update other user email and role', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .get('me')
        .should.be.eventually.fulfilled
        .then(function (response) {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), adminAccessToken)
            .update(response.data.id, {
              'email': 'createUserOauthTest' + timeStamp + '@funkifake.com',
              'role': 'USER'
            })
        })
        .should.be.eventually.fulfilled.should.notify(done)
    })

    it('403 is returned when request to update user role to ROOT', function (done) {
      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .get('me')
        .should.be.eventually.fulfilled
        .then(function (response) {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), adminAccessToken)
            .update(response.data.id, {
              'email': 'createUserOauthTest' + timeStamp + '@funkifake.com',
              'role': 'ROOT'
            })
        })
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 403)
        })
        .should.notify(done)
    })

    it('204 is returned when request update properties changing values', function (done) {
      var propertiesUpdate = {
        'propertyKey1': 'propertyValueUpdate1',
        'propertyKey2': 'propertyValueUpdate2'
      }

      corbelDriver.oauth.user(oauthCommon.getClientParams(), accessToken)
        .update('me', {'properties': propertiesUpdate})
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.properties.propertyKey1', 'propertyValueUpdate1')
          expect(response).to.have.deep.property('data.properties.propertyKey2', 'propertyValueUpdate2')
        })
        .should.notify(done)
    })

    it('204 is returned when request update properties adding more properties', function (done) {
      var propertiesUpdate = {
        'propertyKey3': 'propertyValueUpdate3'
      }

      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .update('me', {'properties': propertiesUpdate})
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken).get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.have.deep.property('data.properties.propertyKey1', 'propertyValue1')
          expect(response).to.have.deep.property('data.properties.propertyKey2', 'propertyValue2')
          expect(response).to.have.deep.property('data.properties.propertyKey3', 'propertyValueUpdate3')
        })
        .should.notify(done)
    })

    it('204 is returned when request update properties removing a property ', function (done) {
      var propertiesUpdate = {
        'propertyKey1': null
      }

      corbelDriver.oauth
        .user(oauthCommon.getClientParams(), accessToken)
        .update('me', {'properties': propertiesUpdate})
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), accessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          expect(response).to.not.have.deep.property('data.properties.propertyKey1')
          expect(response).to.have.deep.property('data.properties.propertyKey2', 'propertyValue2')
        })
        .should.notify(done)
    })

    it('404 is returned when request to update root user with admin user', function (done) {
      var rootAccessToken

      oauthCommon
        .getToken(corbelDriver, oauthRootUserTest.username, oauthRootUserTest.password)
        .should.be.eventually.fulfilled
        .then(function (response) {
          rootAccessToken = response.data['access_token']

          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), rootAccessToken)
            .get('me')
            .should.be.eventually.fulfilled
        })
        .then(function (response) {
          return corbelDriver.oauth
            .user(oauthCommon.getClientParams(), adminAccessToken)
            .update(response.data.id, {'email': 'createUserOauthTest' + timeStamp + '@funkifake.com'})
        })
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 404)
        })
        .should.notify(done)
    })

    it('401 is returned when request to get user details and user not exist', function (done) {
      return corbelDriver.oauth
        .user(oauthCommon.getClientParams(), 'BAD ACCESS TOKEN')
        .update('me')
        .should.be.eventually.rejected
        .then(function (response) {
          expect(response).to.have.property('status', 401)
        })
        .should.notify(done)
    })
  })
})
