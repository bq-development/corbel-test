describe('In IAM module', function() {

  var corbelDriver;
  var aud = _.cloneDeep(corbelTest.CONFIG['aud']);
  var jwtAlgorithm = _.cloneDeep(corbelTest.CONFIG['jwtAlgorithm']);
  var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
  var clientIdrequestDomainClient = _.cloneDeep(corbelTest.CONFIG['clientIdrequestDomainClient']);
  var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
  var clientSecret = '176ffba7f85493f781b5f31f7bf43a1133d32fec3aadf207cd2bc48393a19e17';
  var requestDomain = _.cloneDeep(corbelTest.CONFIG['requestDomain']);
  var requestDomainClient = _.cloneDeep(corbelTest.CONFIG['requestDomainClient']);
  var clientIdSilkroad = _.cloneDeep(corbelTest.CONFIG['clientIdSilkroad']);

  before(function() {
    corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
  });

  describe('when requests an access token and the requested domain not exists', function() {
    it('fails returning error UNAUTHORIZED(401)', function(done) {
      var claims = {
        //client domain _silkroad
        iss: clientIdSilkroad,
        'request_domain': 'fail',
        aud: aud,
        scope: claimDefault.scopes,
        version: version
      };

      corbelDriver.iam.token().create({
        jwt: corbel.jwt.generate(
          claims,
          clientSecret,
          jwtAlgorithm
        )
      }).should.eventually.be.rejected.
      then(function(e) {
        expect(e.data.status).to.be.equal(401);
        // After solve the bug there will be unnecesary parse 'e'
        var error = JSON.parse(e.data.responseText);
        expect(error.error).to.be.equal('unauthorized');
      }).
      should.notify(done);
    });
  });

  describe('when requests an access token', function() {
    describe('and the client is not authorized in the request_domain parameter', function() {
      it.skip('fails returning error UNAUTHORIZED(401)', function(done) {
        var claims = {
          //client domain silkroad-qa
          scope: '',
          iss: claimDefault.clientId,
          'request_domain': requestDomainClient,
          aud: aud,
          version: version
        };
        corbelDriver.iam.token().create({
          jwt: corbel.jwt.generate(
            claims,
            claimDefault.clientSecret,
            jwtAlgorithm
          )
        }).should.eventually.be.rejected.
        then(function(e) {
          expect(e.data.status).to.be.equal(401);
          // After solve the bug there will be unnecesary parse 'e'
          var error = JSON.parse(e.data.responseText);
          expect(error.error).to.be.equal('unauthorized');
        }).
        should.notify(done);
      });
    });
  });

  describe('when requests an access token with allowed client domain and claims scopes', function() {
    it('successes returning an access token', function(done) {
      var claims = {
        //client domain _silkroad
        iss: clientIdSilkroad,
        'request_domain': requestDomainClient,
        scope: 'iam:user:create iam:user:me evci:event:publish',
        aud: aud,
        version: version
      };

      corbelDriver.iam.token().create({
        jwt: corbel.jwt.generate(
          claims,
          clientSecret,
          jwtAlgorithm
        )
      }).should.eventually.be.fulfilled.and.
      notify(done);
    });
  });

  describe('when requests an access token with request_domain parameter', function() {
    describe('and client domain is an allowed domain', function() {
      it('successes returning an access token', function(done) {
        var claims = {
          //client domain _silkroad
          iss: clientIdSilkroad,
          'request_domain': requestDomain,
          aud: aud,
          scope: claimDefault.scopes,
          version: version
        };

        corbelDriver.iam.token().create({
          jwt: corbel.jwt.generate(
            claims,
            clientSecret,
            jwtAlgorithm
          )
        }).should.eventually.be.fulfilled.notify(done);
      });
    });
  });

  describe('when requests an access token with allowed client domain and not allowed claims scopes', function() {
    it('fails returning error UNAUTHORIZED(401)', function(done) {
      var claims = {
        //client domain _silkroad
        iss: clientIdSilkroad,
        'request_domain': requestDomainClient,
        aud: aud,
        scope: claimDefault.scopes,
        version: version
      };

      corbelDriver.iam.token().create({
        jwt: corbel.jwt.generate(
          claims,
          clientSecret,
          jwtAlgorithm
        )
      }).should.eventually.be.rejected.
      then(function(e) {
        expect(e.data.status).to.be.equal(401);
        // After solve the bug there will be unnecesary parse 'e'
        var error = JSON.parse(e.data.responseText);
        expect(error.error).to.be.equal('unauthorized');
      }).
      should.notify(done);
    });
  });

  describe('when requests an access token with not allowed request domain and client scopes', function() {
    it('fails returning error UNAUTHORIZED(401)', function(done) {
      var claims = {
        //client bitbloq-client
        iss: clientIdrequestDomainClient,
        'request_domain': requestDomainClient,
        scope: 'resources:sap:errors',
        aud: aud,
        version: version
      };

      corbelDriver.iam.token().create({
        jwt: corbel.jwt.generate(
          claims,
          '2348cc36d4e0bfbc24285b3163c2b9e5ea465c3674305b1a6deaf2ade464ae66',
          jwtAlgorithm
        )
      }).should.eventually.be.rejected.then(function(e) {
        expect(e.data.status).to.be.equal(401);
        // After solve the bug there will be unnecesary parse 'e'
        var error = JSON.parse(e.data.responseText);
        expect(error.error).to.be.equal('unauthorized');
      }).should.notify(done);
    });
  });


  describe('when requests an access token with allowed client domain ', function() {
    describe('and some not allowed scopes for request_domain parameter', function() {
      it('fails returning error UNAUTHORIZED(401)', function(done) {
        var claims = {
          //client domain _silkroad
          iss: clientIdSilkroad,
          'request_domain': requestDomainClient,
          scope: 'evci:event:publish iam:user:create resources:sap:errors',
          aud: aud,
          version: version
        };

        corbelDriver.iam.token().create({
          jwt: corbel.jwt.generate(
            claims,
            clientSecret,
            jwtAlgorithm
          )
        }).should.eventually.be.rejected.
        then(function(e) {
          expect(e.data.status).to.be.equal(401);
          // After solve the bug there will be unnecesary parse 'e'
          var error = JSON.parse(e.data.responseText);
          expect(error.error).to.be.equal('unauthorized');
        }).
        should.notify(done);
      });
    });
  });
});
