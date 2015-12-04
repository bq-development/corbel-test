describe('In IAM module', function() {

    describe('creating a token', function() {

        var corbelAdminDriver;
        var corbelNewDriver;
        var claimAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
        var claimsDefaultUserDriver = _.cloneDeep(corbelTest.CONFIG['DEFAULT_USER']);
        var tokenValidation = /^.+\..+\..+$/;
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';


        it('with expiration time, an access token with expiration time is returned', function(done) {
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

            corbelNewDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled.and
                .then(function(response) {
                    expect(response).to.have.deep.property('data.accessToken').and.to.match(tokenValidation);
                    expect(response).to.have.deep.property('data.expiresAt', claims.exp * 1000);
                })
                .should.notify(done);
        });

        it('with prn, an access token with expiration time is returned', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': 'iam:user:me',
                'version': version
            };
            var userData;
            corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
            corbelNewDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
            });

            corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(user) {
                    userData = user[0];
                    claims.prn = userData.email;
                    return corbelNewDriver.iam.token()
                        .create({
                            jwt: corbel.jwt.generate(
                                claims,
                                claimAdmin.clientSecret,
                                jwtAlgorithm
                            )
                        })
                        .should.be.eventually.fulfilled;
                })
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
                    return corbelAdminDriver.iam.user(userData.id)
                        .delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('with prn as null, an access token with expiration time is returned', function(done) {
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

            corbelNewDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.accessToken').and.to.match(tokenValidation);
                    expect(response).to.have.deep.property('data.expiresAt', claims.exp * 1000);
                })
                .should.notify(done);
        });
    });
});
