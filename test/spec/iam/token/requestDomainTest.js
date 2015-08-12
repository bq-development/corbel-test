/*jshint multistr: true */
describe('In IAM module when requests an access token', function() {

  var corbelDriver;
  var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
  var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
  var aud = 'http://iam.bqws.io';
  var jwtAlgorithm = 'HS256';
  var clientIdrequestDomainClient = 'be246f55';
  var clientSecret = '176ffba7f85493f781b5f31f7bf43a1133d32fec3aadf207cd2bc48393a19e17';
  var requestDomain = 'silkroad-qa';
  var requestDomainClient = 'bitbloq';
  var clientIdSilkroad = 'f6a28cc7';

  before(function() {
    corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
  });

  it('and the requested domain not exists, it fails returning error UNAUTHORIZED(401)', function(done) {
    var claims = {
      'iss': clientIdSilkroad,
      'request_domain': 'fail',
      'aud': aud,
      'scope': claimDefault.scopes,
      'version': version
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
      //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
      var error = JSON.parse(e.data.responseText);
      expect(error.error).to.be.equal('unauthorized');
    }).
    should.notify(done);
  });

  it.skip('and the client is not authorized in the request_domain parameter \
    it fails returning error UNAUTHORIZED(401)', function(done) {
    //TODO improve corbeljs jwt to obtain error
    var clientDomainSilkroadQA = claimDefault.clientId;
    var claims = {
      'scope': '',
      'iss': clientDomainSilkroadQA,
      'request_domain': requestDomainClient,
      'aud': aud,
      'version': version
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
      //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
      var error = JSON.parse(e.data.responseText);
      expect(error.error).to.be.equal('unauthorized');
    }).
    should.notify(done);
  });

  it('with allowed client domain and claims scopes, it successes returning an access token', function(done) {
    var claims = {
      'iss': clientIdSilkroad,
      'request_domain': requestDomainClient,
      'scope': 'iam:user:create iam:user:me evci:event:publish',
      'aud': aud,
      'version': version
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

  it(' with request_domain parameter successes and client domain is an allowed domain, \
     it returning an access token', function(done) {
    var claims = {
      'iss': clientIdSilkroad,
      'request_domain': requestDomain,
      'aud': aud,
      'scope': claimDefault.scopes,
      'version': version
    };

    corbelDriver.iam.token().create({
      jwt: corbel.jwt.generate(
        claims,
        clientSecret,
        jwtAlgorithm
      )
    }).should.eventually.be.fulfilled.notify(done);
  });


  it('with allowed client domain and not allowed claims scopes, \
    it fails returning error UNAUTHORIZED(401)', function(done) {
    var claims = {
      'iss': clientIdSilkroad,
      'request_domain': requestDomainClient,
      'aud': aud,
      'scope': claimDefault.scopes,
      'version': version
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
      //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
      var error = JSON.parse(e.data.responseText);
      expect(error.error).to.be.equal('unauthorized');
    }).
    should.notify(done);
  });


  it('with not allowed request domain and client scopes, it fails returning error UNAUTHORIZED(401)', function(done) {
    var claims = {
      'iss': clientIdrequestDomainClient,
      'request_domain': requestDomainClient,
      'scope': 'resources:sap:errors',
      'aud': aud,
      'version': version
    };

    corbelDriver.iam.token().create({
      jwt: corbel.jwt.generate(
        claims,
        '2348cc36d4e0bfbc24285b3163c2b9e5ea465c3674305b1a6deaf2ade464ae66',
        jwtAlgorithm
      )
    }).should.eventually.be.rejected.then(function(e) {
      expect(e.data.status).to.be.equal(401);
      //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
      var error = JSON.parse(e.data.responseText);
      expect(error.error).to.be.equal('unauthorized');
    }).should.notify(done);
  });



  it('with allowed client domain and some not allowed scopes for request_domain parameter, \
    it fails returning error UNAUTHORIZED(401)', function(done) {
    var claims = {
      'iss': clientIdSilkroad,
      'request_domain': requestDomainClient,
      'scope': 'evci:event:publish iam:user:create resources:sap:errors',
      'aud': aud,
      'version': version
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
      //TODO fix bug in corbeljs, after solve the bug there will be unnecesary parse 'e'
      var error = JSON.parse(e.data.responseText);
      expect(error.error).to.be.equal('unauthorized');
    }).
    should.notify(done);

  });
});
