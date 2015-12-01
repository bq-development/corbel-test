describe.only('In IAM module, implicit scopes', function() {


    var corbelAdminDriver;
    var corbelDefaultDriver;
    var corbelDefaultUserDriver;
    var claimsAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
    var claimsDefaultUserDriver = _.cloneDeep(corbelTest.CONFIG['DEFAULT_USER']);

    beforeEach(function() {
        corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelDefaultUserDriver = corbelTest.drivers['DEFAULT_USER'].clone();

    });


    it('when request client login without a scopes,successes returning an access token', function(done) {

        corbelAdminDriver = corbel.getDriver({
            'clientId': claimsAdmin.clientId,
            'clientSecret': claimsAdmin.clientSecret,
            'urlBase': corbelTest.CONFIG.COMMON.urlBase,
            'scopes': []
        });

        corbelAdminDriver.iam.token()
            .create()
            .should.be.eventually.fulfilled
            .then(function(response) {

                expect(response).to.have.deep.property('data.accessToken');
                return corbelAdminDriver.iam.user('fooid')
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', 'fooid');
            })
            .should.notify(done);
    });

    it('when request user login with empty scopes successes returning an access token', function(done) {
        corbelDefaultDriver.iam
            .token()
            .create({
                claims: {
                    'basic_auth.username': claimsDefaultUserDriver.username,
                    'basic_auth.password': claimsDefaultUserDriver.password,
                    'scopes': ''
                }
            })
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.accessToken');
                return corbelDefaultDriver.iam.user('me')
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', claimsDefaultUserDriver.username);
            })
            .should.notify(done);
    });

    it('when request an access token with request domain without a scopes', function(done) {
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';
        var clientSecret = '176ffba7f85493f781b5f31f7bf43a1133d32fec3aadf207cd2bc48393a19e17';

        var claims = {
            'iss': 'f6a28cc7',
            'request_domain': requestDomain,
            'aud': aud,
            'scope': [],
            'version': version
        };

        var corbelNewDriver = corbel.getDriver({
            domain: corbelTest.CONFIG.DOMAIN,
            urlBase: corbelTest.CONFIG.COMMON.urlBase
        });

        corbelNewDriver.iam
            .token()
            .create({
                jwt: corbel.jwt.generate(
                    claims,
                    clientSecret,
                    jwtAlgorithm
                )
            })
            .should.be.eventually.fulfilled
            .and
            .should.notify(done);
    });

});
