describe('In IAM module, while using implicit scopes', function() {

    it('when request client login without scopes, an access token is returned', function(done) {
        var claimsAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
        var corbelNewDriver = corbel.getDriver({
            'clientId': claimsAdmin.clientId,
            'clientSecret': claimsAdmin.clientSecret,
            'urlBase': corbelTest.CONFIG.COMMON.urlBase,
            'scopes': []
        });

        corbelNewDriver.iam.token()
            .create()
            .should.be.eventually.fulfilled
            .then(function(response) {

                expect(response).to.have.deep.property('data.accessToken');
                return corbelNewDriver.iam.user('fooid')
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', 'fooid');
            })
            .should.notify(done);
    });

    it('when request user login with empty scopes, an access token is returned', function(done) {
        var claimsDefaultUserDriver = _.cloneDeep(corbelTest.CONFIG['DEFAULT_USER']);
        var corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

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

    it('when request an access token through a domain request without scopes', function(done) {
        var claimsClientDriver = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';
        var tokenValidation = /^.+\..+\..+$/;
        var claims = {
            'iss': claimsClientDriver.clientId,
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
                    claimsClientDriver.clientSecret,
                    jwtAlgorithm
                )
            })
            .should.be.eventually.fulfilled
            .then(function(token) {
                expect(token).to.have.deep.property('data.accessToken').and.to.match(tokenValidation);

            })
            .should.notify(done);
    });
});
