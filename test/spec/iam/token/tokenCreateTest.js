describe('In IAM module', function() {

    describe('create token requires a JWT with grant_type and assertion and when is valid', function() {

        var corbelAdminDriver;
        var corbelNewDriver;
        var claimAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
        var claimsDefaultUserDriver = _.cloneDeep(corbelTest.CONFIG['DEFAULT_USER']);
        var tokenValidation = /^.+\..+\..+$/;
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';
        var userData;

        before(function(done) {
            corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
            corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(user) {
                    userData = user[0];
                })
                .should.notify(done);
        });

        after(function(done) {
            corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
            corbelAdminDriver.iam.user(userData.id)
                .delete()
                .should.be.eventually.fulfilled
                .and
                .should.notify(done);
        });

        it.only('successes returning an access token and expiration time', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            corbelNewDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
            });

            corbelNewDriver.iam
                .token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var accessToken = response.data.accessToken;
                    expect(response.data.accessToken).to.match(tokenValidation);
                    expect(response.data).to.have.deep.property('expiresAt', claims.exp * 1000);
                })
                .should.notify(done);
        });

        it('with prn successes returning an access token and expiration time', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': 'iam:user:me',
                'version': version,
                'prn': userData.email
            };

            corbelNewDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
            });

            corbelNewDriver.iam
                .token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.accessToken');
                    expect(response).to.have.deep.property('data.expiresAt');
                    return corbelNewDriver.iam.user('me')
                        .get()
                        .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.firstName', userData.firstName);
                    expect(response).to.have.deep.property('data.email', userData.email.toLowerCase());
                    expect(response).to.have.deep.property('data.username', userData.username);
                })
                .should.notify(done);
        });

        it('with prn null successes returning an access token and expiration time', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'prn': null
            };

            corbelNewDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
            });

            corbelNewDriver.iam
                .token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var accessToken = response.data.accessToken;
                    expect(response.data.accessToken).to.match(tokenValidation);
                    expect(response.data).to.have.deep.property('expiresAt', claims.exp * 1000);
                })
                .should.notify(done);
        });
    });
});
