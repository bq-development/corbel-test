/*jshint multistr: true */
describe('In IAM module when requests an access token', function() {
  var corbelDriver;
  var driverRootClient;
  var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
  var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
  var aud = 'http://iam.bqws.io';
  var jwtAlgorithm = 'HS256';
  var domainId;
  var domain;
  var clientId;
  var clientSecret;

  var testDriver = corbel.getDriver({
    urlBase : corbelTest.CONFIG.COMMON.urlBase.replace('{{ENV}}', 'int')
  });

  before(function() {
    corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    driverRootClient = corbelTest.drivers['ROOT_CLIENT'];
  });



  it('and the requested domain not exists, it fails returning error UNAUTHORIZED(401)', function(done) {

    var claims = {
      'iss': claimDefault.clientId,
      'request_domain': 'fail',
      'aud': aud,
      'scope': claimDefault.scopes,
      'version': version
    };

    testDriver.iam.token()
      .create({
        jwt: corbel.jwt.generate(
          claims,
          claimDefault.clientSecret,
          jwtAlgorithm
        )
      })
      .should.eventually.be.rejected
      .then(function(e) {
        expect(e.data.status).to.be.equal(401);
        //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
        var error = JSON.parse(e.data.responseText);
        expect(error.error).to.be.equal('unauthorized');
      })
      .should.eventually.be.fulfilled.notify(done);
  });

  it(' with request_domain parameter successes and client domain is an allowed domain,' +
    'it returning an access token',
    function(done) {
      var requestDomain = 'silkroad-qa';
      var claims = {
        'iss': claimDefault.clientId,
        'request_domain': requestDomain,
        'aud': aud,
        'scope': claimDefault.scopes,
        'version': version
      };

      testDriver.iam.token()
        .create({
          jwt: corbel.jwt.generate(
            claims,
            claimDefault.clientSecret,
            jwtAlgorithm
          )
        })
        .should.eventually.be.fulfilled.notify(done);
    });

  describe('with not allowed request domain ', function() {

    domain = {
      id: 'newDpmain_' + Date.now(),
      description: 'domain access token',
      scopes: ['iam:user:create', 'iam:user:delete', 'iam:user:me'],
      defaultScopes: ['iam:user:me']
    };
    var clientIdrequestDomainClient = '5ead369e';

    before(function(done) {

     corbelTest.iam.createDomain(driverRootClient, domain)
        .then(function(response) {
          domainId = response.data.id;
          done();
        });
    });

    after(function(done) {
      driverRootClient.iam.domain(domainId)
        .remove()
        .should.eventually.be.fulfilled
        .should.notify(done);
    });

    it('and client scopes,it fails returning error UNAUTHORIZED(401)', function(done) {

      var claims = {
        'iss': clientIdrequestDomainClient,
        'request_domain': domainId,
        'scope': 'resources:sap:errors',
        'aud': aud,
        'version': version
      };

      testDriver.iam.token().create({
          jwt: corbel.jwt.generate(
            claims,
            '2348cc36d4e0bfbc24285b3163c2b9e5ea465c3674305b1a6deaf2ade464ae66',
            jwtAlgorithm
          )
        })
        .should.eventually.be.rejected
        .then(function(e) {
          expect(e.data.status).to.be.equal(401);
          //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
          var error = JSON.parse(e.data.responseText);
          expect(error.error).to.be.equal('unauthorized');
        })
        .should.eventually.be.fulfilled.notify(done);
    });
  });

  describe('with allowed client domain ', function() {

    domain = {
      id: 'newDpmain_' + Date.now(),
      description: 'domain access token',
      scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
      defaultScopes: ['iam:user:me']
    };

    var client = {
      name: 'client1',
      signatureAlgorithm: 'HS256',
      scopes: ['iam:user:create', 'iam:user:delete', 'iam:user:me']
    };

    before(function(done) {

      corbelTest.iam.createDomain(driverRootClient, domain)
        .then(function(response) {
          domainId = response.data.id;
          return corbelTest.iam.createClientDomain(driverRootClient, domainId, client)
            .should.eventually.be.fulfilled;
        })
        .then(function(response) {
          clientSecret = response.data.key;
          clientId = response.data.id;
          done();
        });
    });

    after(function(done) {

      driverRootClient.iam.domain(domainId)
        .remove()
        .should.eventually.be.fulfilled
        .should.notify(done);

    });

    it('and some not allowed scopes for request_domain parameter, \
    it fails returning error UNAUTHORIZED(401)', function(done) {
      var claims = {
        'iss': clientId,
        'request_domain': domainId,
        'scope': 'evci:event:publish iam:user:create resources:sap:errors',
        'aud': aud,
        'version': version
      };
      testDriver.iam.token().create({
          jwt: corbel.jwt.generate(
            claims,
            clientSecret,
            jwtAlgorithm
          )
        })
        .should.eventually.be.rejected
        .then(function(e) {
          expect(e.data.status).to.be.equal(401);
          //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
          var error = JSON.parse(e.data.responseText);
          expect(error.error).to.be.equal('unauthorized');
        })
        .should.eventually.be.fulfilled.notify(done);
    });

    it('and claims scopes, it successes returning an access token', function(done) {
      var claims = {
        'iss': clientId,
        'request_domain': domainId,
        'scope': 'iam:user:create iam:user:me',
        'aud': aud,
        'version': version
      };

      testDriver.iam.token()
        .create({
          jwt: corbel.jwt.generate(
            claims,
            clientSecret,
            jwtAlgorithm
          )
        })
        .should.eventually.be.fulfilled.notify(done);
    });


    it('and not allowed claims scopes, it fails returning error UNAUTHORIZED(401)', function(done) {
      var claims = {
        'iss': clientId,
        'request_domain': domainId,
        'aud': aud,
        'scope': 'evci:event:publish iam:user:create resources:sap:errors',
        'version': version
      };
      testDriver.iam.token()
        .create({
          jwt: corbel.jwt.generate(
            claims,
            clientSecret,
            jwtAlgorithm
          )
        })
        .should.eventually.be.rejected
        .then(function(e) {
          expect(e.data.status).to.be.equal(401);
          //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
          var error = JSON.parse(e.data.responseText);
          expect(error.error).to.be.equal('unauthorized');
        })
        .should.eventually.be.fulfilled.notify(done);
    });

    it.skip('and the client is not authorized in the request_domain parameter' +
      'it fails returning error UNAUTHORIZED(401)',
      function(done) {

        var clientDomainSilkroadQA = claimDefault.clientId;
        var claims = {
          'scope': '',
          'iss': clientDomainSilkroadQA,
          'request_domain': domainId,
          'aud': aud,
          'version': version
        };
        return testDriver.iam.token()
          .create({
            jwt: corbel.jwt.generate(
              claims,
              claimDefault.clientSecret,
              jwtAlgorithm
            )
          })
          .should.eventually.be.rejected
          .then(function(e) {
            expect(e.data.status).to.be.equal(401);
            //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
            var error = JSON.parse(e.data.responseText);
            expect(error.error).to.be.equal('unauthorized');
          })
          .should.eventually.be.fulfilled.notify(done);
      });
  });
});
