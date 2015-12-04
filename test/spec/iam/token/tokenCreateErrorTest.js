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
            var urlBase = corbelTest.CONFIG.COMMON.urlBase.replace('{{module}}', corbel.Iam.moduleName);
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'unauthorized');
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
                    expect(e).to.have.deep.property('status', 400);
                    expect(e.data).to.have.deep.property('error', 'invalid_grant');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'no_such_principal');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'no_such_principal');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'unauthorized');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'unauthorized');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'invalid_time');
                })
                .should.notify(done);
        });

        it('an error [401] is returned if the expired field is less than the current time', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'exp': 10
            };

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'invalid_time');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'unauthorized');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'unauthorized');
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
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'unauthorized');
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
                    expect(e).to.have.deep.property('status', 400);
                    expect(e.data).to.have.deep.property('error', 'invalid_grant');
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
                    expect(e).to.have.deep.property('status', 400);
                    expect(e.data).to.have.deep.property('error', 'invalid_grant');
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
                    expect(e).to.have.deep.property('status', 400);
                    expect(e.data).to.have.deep.property('error', 'invalid_grant');
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
                    expect(e).to.have.deep.property('status', 400);
                    expect(e.data).to.have.deep.property('error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('an error [401] is returned JWT use invalid signature key', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            var clientSecretInvalid = '90f6ed907ce7e2426e51aa52a18470195f4eb04725beb41569db3f796a018dcc';

            corbelDriver = corbel.getDriver({
                domain: corbelTest.CONFIG.DOMAIN,
                urlBase: corbelTest.CONFIG.COMMON.urlBase
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
                    expect(e).to.have.deep.property('status', 401);
                    expect(e.data).to.have.deep.property('error', 'unauthorized');
                })
                .should.notify(done);
        });

        //oauth function is not implemented yet in corbel-js
        it.skip('an error [400] is returned use get token withouth oauth params', function(done) {
            var user;
            var corbelAdminDriver;
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'prn': user
            };

            var assertion = corbel.jwt.generate(
                claims,
                claimAdmin.clientSecret,
                jwtAlgorithm
            );
            var params;
            params.oauthVerifier = '';
            params.oauthToken = '';
            params.oauthRedirectUri = '';
            params.oauthAccessToken = '';
            params.oauthCode = '';
            params.service = '';

            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.GET,
                query: corbel.utils.param(corbel.utils.extend({
                    'assertion': assertion,
                    'grant_type': corbel.Iam.GRANT_TYPE
                }, params))
            };

            corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(user) {
                    user = user[0];
                    return corbel.request.send(args)
                        .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.deep.property('status', 400);
                    expect(e.data).to.have.deep.property('error', 'missing_oauth_params');
                    return corbelAdminDriver.iam.user(user.id)
                        .delete()
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});
