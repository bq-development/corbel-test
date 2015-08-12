    describe('In IAM module, when I try to make a token request', function() {

      var corbelDriver;
      var aud = _.cloneDeep(corbelTest.CONFIG['aud']);
      var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
      var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
      var claims = {
        iss: claimDefault.clientId,
        aud: aud,
        scope: claimDefault.scopes
      };

      before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
      });

      var UNSUPPORTED_VERSION = '0.0.0';
      var SUPPORTED_VERSION = '1.0.0';
      var FORCE_UPDATE_MESSAGE = 'unsupported_version';
      var FORCE_UPDATE_CODE = 403;

      it('without version, it works', function(done) {
        claims.version = undefined;
        corbelDriver.iam.token().create({
          jwt: corbel.jwt.generate(claims, claimDefault.clientSecret)
        }).
        should.notify(done);
      });

      it('with obsolete version, it fails with 403 - "unsupported_version"', function(done) {

        claims.version = UNSUPPORTED_VERSION;

        corbelDriver.iam.token().create({
          jwt: corbel.jwt.generate(claims, claimDefault.clientSecret)
        }).
        should.eventually.be.rejected.
        then(function(e) {
          // After solve the bug there will be unnecesary parse 'e'
          var error = JSON.parse(e.data.responseText);
          expect(error.error).to.be.equal(FORCE_UPDATE_MESSAGE);
          expect(e.status).to.be.equal(FORCE_UPDATE_CODE);
        }).
        should.notify(done);
      });

      it('with compatible version, it works', function(done) {

        claims.version = SUPPORTED_VERSION;

        corbelDriver.iam.token().create({
          jwt: corbel.jwt.generate(claims, claimDefault.clientSecret)
        }).
        should.notify(done);
      });
    });
