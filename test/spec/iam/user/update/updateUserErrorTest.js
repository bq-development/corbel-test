describe('In IAM module', function () {
  describe('while testing update user', function () {
    var corbelDriver
    var user
    var emailDomain = '@funkifake.com'

    before(function () {
      corbelDriver = corbelTest.drivers['ADMIN_USER'].clone()
    })

    beforeEach(function (done) {
      corbelTest.common.iam.createUsers(corbelDriver, 1)
        .should.be.eventually.fulfilled
        .then(function (createdUsers) {
          user = createdUsers[0]
        })
        .should.notify(done)
    })

    afterEach(function (done) {
      corbelDriver.iam.user(user.id)
        .delete()
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.iam.user(user.id)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })

    it('an error is returned while trying to update an username with another that already exists', function (done) {
      var secondUser
      var newUserName = 'NewUserName' + Date.now()

      corbelTest.common.iam.createUsers(corbelDriver, 1)
        .should.be.eventually.fulfilled
        .then(function (createdUsers) {
          secondUser = createdUsers[0]

          return corbelDriver.iam.user(user.id)
            .update({
              'username': newUserName
            })
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.iam.user(secondUser.id)
            .update({
              'username': newUserName
            })
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 409)
          expect(e).to.have.deep.property('data.error', 'conflict')
        })
        .then(function () {
          return corbelDriver.iam.user(secondUser.id)
            .delete()
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('an error is returned while trying to update an email with another that already exists', function (done) {
      var secondUser
      var newEmail = 'NewEmail' + Date.now() + emailDomain

      corbelTest.common.iam.createUsers(corbelDriver, 1)
        .should.be.eventually.fulfilled
        .then(function (createdUsers) {
          secondUser = createdUsers[0]

          return corbelDriver.iam.user(user.id)
            .update({
              'email': newEmail
            })
            .should.be.eventually.fulfilled
        })
        .then(function () {
          return corbelDriver.iam.user(secondUser.id)
            .update({
              'email': newEmail
            })
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 409)
          expect(e).to.have.deep.property('data.error', 'conflict')
        })
        .then(function () {
          return corbelDriver.iam.user(secondUser.id)
            .delete()
            .should.be.eventually.fulfilled
        })
        .should.notify(done)
    })

    it('an error [403] is returned while trying to update an user with incorrect email', function (done) {
      corbelDriver.iam.user(user.id)
        .update({
          'email': 'incorrect'
        })
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 422)
          expect(e).to.have.deep.property('data.error', 'invalid_entity')
        })
        .should.notify(done)
    })

    it('an error [403] is returned while trying to update an user with incorrect scopes', function (done) {
      corbelDriver.iam.user(user.id)
        .update({
          'scopes': ['incorrect:scope']
        })
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 403)
          expect(e).to.have.deep.property('data.error', 'scopes_not_allowed')
        })
        .should.notify(done)
    })

    it('an error [404] is returned while trying to update an unexistent user', function (done) {
      corbelDriver.iam.user('unexistent')
        .update({
          'firstName': 'user Modified'
        })
        .should.be.eventually.rejected
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })
  })
})
