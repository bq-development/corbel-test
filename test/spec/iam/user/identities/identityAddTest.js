describe('In IAM module', function () {
  var corbelDriver
  var userId
  var random
  var domainEmail = '@funkifake.com'

  before(function () {
    corbelDriver = corbelTest.drivers['ADMIN_USER'].clone()
  })
  describe('while testing add identity', function () {
    beforeEach(function (done) {
      random = Date.now()
      var user = {
        'firstName': 'add.identity-' + random,
        'email': 'add.identity.' + random + domainEmail,
        'username': 'add.identity.' + random + domainEmail,
        'scopes': ['iam:user:create', 'resources:music:read_catalog', 'resources:music:streaming']
      }

      corbelDriver.iam.users()
        .create(user)
        .should.be.eventually.fulfilled
        .then(function (id) {
          userId = id
        })
        .should.notify(done)
    })

    afterEach(function (done) {
      corbelDriver.iam.user(userId).delete()
        .should.be.eventually.fulfilled
        .then(function () {
          return corbelDriver.iam.user(userId)
            .get()
            .should.be.eventually.rejected
        })
        .then(function (e) {
          expect(e).to.have.property('status', 404)
          expect(e).to.have.deep.property('data.error', 'not_found')
        })
        .should.notify(done)
    })

    describe('adding a new social identity to an existing user', function () {
      it('should add a facebook entity', function (done) {
        corbelDriver.iam.user(userId).addIdentity({
          'oauthService': 'facebook',
          'oauthId': random
        })
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.iam.user(userId)
              .getIdentities()
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data[0].oauthService', 'facebook')
          })
          .should.notify(done)
      })

      it('should request a silkroad identity for user', function (done) {
        corbelDriver.iam.user(userId).addIdentity({
          'oauthService': 'silkroad',
          'oauthId': random
        })
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.iam.user(userId)
              .getIdentities()
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data[0].oauthService', 'silkroad')
          })
          .should.notify(done)
      })

      it('should add a google entity', function (done) {
        corbelDriver.iam.user(userId).addIdentity({
          'oauthService': 'google',
          'oauthId': random
        })
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.iam.user(userId)
              .getIdentities()
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data[0].oauthService', 'google')
          })
          .should.notify(done)
      })

      it('should add multiple entities', function (done) {
        corbelDriver.iam.user(userId).addIdentity({
          'oauthService': 'google',
          'oauthId': random
        })
          .should.be.eventually.fulfilled
          .then(function () {
            return corbelDriver.iam.user(userId).addIdentity({
              'oauthService': 'facebook',
              'oauthId': random
            })
              .should.be.eventually.fulfilled
          })
          .then(function () {
            return corbelDriver.iam.user(userId)
              .getIdentities()
              .should.be.eventually.fulfilled
          })
          .then(function (response) {
            expect(response).to.have.deep.property('data.length', 2)
            var oauthServicesAux = []
            oauthServicesAux.push(response.data[0].oauthService)
            oauthServicesAux.push(response.data[1].oauthService)
            expect(oauthServicesAux).to.contain('facebook')
            expect(oauthServicesAux).to.contain('google')
          })
          .should.notify(done)
      })
    })
  })
})
