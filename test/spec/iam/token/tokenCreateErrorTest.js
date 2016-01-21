describe('In IAM module', function() {

    describe('when creating an invalid token', function() {
        var corbelDriver;
        var claimAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
        var claimsDefaultUserDriver = _.cloneDeep(corbelTest.CONFIG['DEFAULT_USER']);
        var tokenValidation = /^.+\..+\..+$/;
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';

        var buildUri = function(uri) {
            var urlBase = corbelTest.getCurrentEndpoint('oauth');
            return urlBase + uri;
        };

        it('an error [401] is returned if the user does not have propper permissions', function(done) {
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                data: {
                    assertion: 'Any_Assertion',
                    'grant_type': corbel.Iam.GRANT_TYPE
                },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                withCredentials: true
            };
            corbel.request.send(args)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [400] is returned if the grant type is invalid', function(done) {
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                data: {
                    'grant_type': corbel.Iam.GRANT_TYPE
                        //missing assertion
                },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                withCredentials: true
            };
            corbel.request.send(args)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the prn is invalid', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'prn': 'userexampleorg'
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'no_such_principal');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the prn is empty', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'prn': ''
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'no_such_principal');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the audience is invalid', function(done) {

            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': 'http://iam.INVALID.io',
                'scope': claimAdmin.scopes,
                'version': version
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam
                .token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the audience is not present', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': undefined,
                'scope': claimAdmin.scopes,
                'version': version
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt._generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the expired field is greater than maximun', function(done) {
            var getExpPlus = Math.round((new Date().getTime() / 1000)) + 3700;
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'exp': getExpPlus
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'invalid_time');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the expired field is lower than the current time', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'exp': 10
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'invalid_time');
                })
                .should.notify(done);
        });


        it('an error [401] is returned if the expired field is not present', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt._generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });


        it('an error [401] is returned if the issuer field is wrong', function(done) {
            var claims = {
                'iss': 'wrongIssId',
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the issuer field is not present', function(done) {
            var claims = {
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt._generate(
                        claims,
                        claimAdmin.clientSecret,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [400] is returned if the grant type is unsupported', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            var assertion = {
                jwt: corbel.jwt.generate(
                    claims,
                    claimAdmin.clientSecret,
                    jwtAlgorithm)
            };
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                data: {
                    'assertion': assertion,
                    'grant_type': 'xxx' //invalid grant_type

                },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                withCredentials: true
            };

            corbel.request.send(args)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('an error [400] is returned if the grant type has incorrect oauth', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            var assertion = {
                jwt: corbel.jwt.generate(
                    claims,
                    claimAdmin.clientSecret,
                    jwtAlgorithm)
            };
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                data: {
                    'assertion': assertion,
                    'grant_type': 'urn:ietf:params:oauth:gtype:jwt-bearer'
                },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                withCredentials: true
            };

            corbel.request.send(args)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('an error [400] is returned if the grant type has incorrect urn', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            var assertion = {
                jwt: corbel.jwt.generate(
                    claims,
                    claimAdmin.clientSecret,
                    jwtAlgorithm)
            };
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                data: {
                    'assertion': assertion,
                    'grant_type': 'urn::params:oauth:grant-type:jwt-bearer'
                },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                withCredentials: true
            };

            corbel.request.send(args)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('an error [400] is returned if the grant type is not present', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            var assertion = {
                jwt: corbel.jwt.generate(
                    claims,
                    claimAdmin.clientSecret,
                    jwtAlgorithm)
            };
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                data: {
                    'assertion': assertion,
                    'grant_type': 'urn::params:oauth:grant-type:jwt-bearer'
                },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                withCredentials: true
            };
            corbel.request.send(args)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if JWT uses invalid signature key', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            var clientSecretInvalid = 'bsvyidwerfheyythjrtyrtkhfgeasehthtarethoeabnvuwqyeqwnpqewerdwr';

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN
            });

            corbelDriver.iam.token()
                .create({
                    jwt: corbel.jwt.generate(
                        claims,
                        clientSecretInvalid,
                        jwtAlgorithm
                    )
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('an error [400] is returned using get token withouth oauth params', function(done) {
            var claims = {
                iss: claimAdmin.clientId,
                aud: aud,
                scope: claimAdmin.scopes,
                'oauth.service': 'facebook'
            };
            var assertion = corbel.jwt.generate(
                claims,
                claimAdmin.clientSecret,
                jwtAlgorithm
            );
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                data: {
                    assertion: assertion,
                    'grant_type': corbel.Iam.GRANT_TYPE
                }
            };
            return corbel.request.send(args)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'missing_oauth_params');
                })
                .should.notify(done);
        });
    });
});
