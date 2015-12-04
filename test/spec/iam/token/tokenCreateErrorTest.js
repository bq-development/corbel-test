describe('In IAM module', function() {

    describe('creating a token invalid because', function() {

        // var corbelAdminDriver;
        var corbelNewDriver;
        var claimAdmin = _.cloneDeep(corbelTest.CONFIG['ADMIN_CLIENT']);
        var claimsDefaultUserDriver = _.cloneDeep(corbelTest.CONFIG['DEFAULT_USER']);
        var tokenValidation = /^.+\..+\..+$/;
        var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
        var aud = 'http://iam.bqws.io';
        var jwtAlgorithm = 'HS256';
        var requestDomain = 'silkroad-qa';
        var user;

        // before(function(done) {
        //     corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        //     corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
        //         .should.be.eventually.fulfilled
        //         .then(function(user) {
        //             user = user[0];
        //         })
        //         .should.notify(done);
        // });

        // after(function(done) {
        //     corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        //     corbelAdminDriver.iam.user(user.id)
        //         .delete()
        //         .should.be.eventually.fulfilled
        //         .and
        //         .should.notify(done);
        // });


        it('assertion is wrong, fails with unauthorized error (401)', function(done) {
            doPostTokenRequest({
                    assertion: 'Any_Assertion',
                    'grant_type': corbel.Iam.GRANT_TYPE
                }, false)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('assertion is not present, fails with invalid_grant (400)', function(done) {
            doPostTokenRequest({
                    'grant_type': corbel.Iam.GRANT_TYPE
                        //missing assertion
                }, false)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('prn is wrong, fails with no_such_principal (401)', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'prn': 'userexampleorg'
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'no_such_principal');
                })
                .should.notify(done);
        });

        it('prn is empty, fails with no_such_principal (401)', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'prn': ''
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'no_such_principal');
                })
                .should.notify(done);
        });

        it('audience is invalid, fails with unauthorized error (401)', function(done) {

            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': 'http://iam.INVALID.io',
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'unauthorized');
                })
                .should.notify(done);
        });

        it.skip('audience is not present, fails with unauthorized error (401)', function(done) {

            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': undefined,
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('expired field is greater than maximun, fails with unauthorized error (401)', function(done) {

            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'exp': getExpPlus()
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'invalid_time');
                })
                .should.notify(done);
        });

        it('expired field is less than current time, fails with unauthorized error (401)', function(done) {
            var claims = {
                'iss': claimAdmin.clientId,
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version,
                'exp': 10
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'invalid_time');
                })
                .should.notify(done);
        });


        it.skip(' expired field is not present, fails with unauthorized error (401)', function(done) {
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'unauthorized');
                })
                .should.notify(done);
        });


        it('issuer field is wrong, fails with unauthorized error (401)', function(done) {
            var claims = {
                'iss': 'wrongIssId',
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
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e.data).to.have.property('error', 'unauthorized');
                })
                .should.notify(done);
        });

        it.skip('issuer is not present, fails with unauthorized error (401)', function(done) {
            var claims = {
                'request_domain': requestDomain,
                'aud': aud,
                'scope': claimAdmin.scopes,
                'version': version
            };
            corbelNewDriver.iam
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
                    expect(e.data).to.have.property('error', 'unauthorized');
                })
                .should.notify(done);
        });

        it('grant_type is unsupported, fails with invalid_grant (400)', function(done) {
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

            doPostTokenRequest({
                    'assertion': assertion,
                    'grant_type': 'xxx' //invalid grant_type

                }, false)
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('grant_type has incorrect oauth, fails with invalid_grant (400)', function(done) {
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

            doPostTokenRequest({
                    'assertion': assertion,
                    'grant_type': 'urn:ietf:params:oauth:gtype:jwt-bearer'
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('grant_type has incorrect urn, fails with invalid_grant (400)', function(done) {
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

            doPostTokenRequest({
                    'assertion': assertion,
                    'grant_type': 'urn::params:oauth:grant-type:jwt-bearer'
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_grant');
                })
                .should.notify(done);
        });

        it('grant_type is not present, fails with invalid_grant (400)', function(done) {
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

            doPostTokenRequest({
                    'assertion': assertion,
                    'grant_type': 'urn::params:oauth:grant-type:jwt-bearer'
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_grant');
                })
                .should.notify(done);
        });

        // it('JWT use invalid signature key, fails with unauthorized (401)', function(done) {
        //     var claims = {
        //         'iss': claimAdmin.clientId,
        //         'request_domain': requestDomain,
        //         'aud': aud,
        //         'scope': claimAdmin.scopes,
        //         'version': version
        //     };
        //     var clientSecretInvalid = '90f6ed907ce7e2426e51aa52a18470195f4eb04725beb41569db3f796a018dcc';

        //     corbelNewDriver = corbel.getDriver({
        //         domain: corbelTest.CONFIG.DOMAIN,
        //         urlBase: corbelTest.CONFIG.COMMON.urlBase
        //     });

        //     corbelNewDriver.iam
        //         .token()
        //         .create({
        //             jwt: corbel.jwt.generate(
        //                 claims,
        //                 clientSecretInvalid,
        //                 jwtAlgorithm
        //             )
        //         })
        //         .should.be.eventually.rejected
        //         .then(function(e) {
        //             expect(e).to.have.property('status', 401);
        //             expect(e.data).to.have.property('error', 'unauthorized');
        //         })
        //         .should.notify(done);
        // });


        // it.skip('use get token withouth oauth params, fails with missing_oauth_params (400)', function(done) {

        //     var claims = {
        //         'iss': claimAdmin.clientId,
        //         'request_domain': requestDomain,
        //         'aud': aud,
        //         'scope': claimAdmin.scopes,
        //         'version': version,
        //         'prn': userData
        //     };

        //     var assertion = corbel.jwt.generate(
        //         claims,
        //         claimAdmin.clientSecret,
        //         jwtAlgorithm
        //     );

        //     doGetTokenRequest({
        //             assertion: assertion
        //         }, false)
        //         .should.be.eventually.rejected
        //         .then(function(e) {
        //             expect(e).to.have.property('status', 400);
        //             expect(e.data).to.have.property('error', 'missing_oauth_params');
        //         })
        //         .should.notify(done);
        // });

        var doPostTokenRequest = function(data, setCookie) {
            var args = {
                url: buildUri('oauth/token'),
                method: corbel.request.method.POST,
                data: data,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                withCredentials: true
            };

            if (setCookie) {
                args.headers = {
                    RequestCookie: 'true'
                };
            }
            return corbel.request.send(args);
        };
        // var doGetTokenRequest = function(params, setCookie) {
        //     var params;
        //     params.oauth_verifier = '';
        //     params.oauth_token = '';
        //     params.oauth_redirect_uri = '';
        //     params.oauth_access_token = '';
        //     params.oauth_code = '';
        //     params.service = '';

        //     var args = {
        //         url: buildUri('oauth/token'),
        //         method: corbel.request.method.GET,
        //         query: corbel.utils.param(corbel.utils.extend({
        //             'assertion': params.assertion,
        //             'grant_type': corbel.Iam.GRANT_TYPE
        //         }, params.oauth))
        //     };

        //     if (setCookie) {
        //         args.headers = {
        //             RequestCookie: 'true'
        //         };
        //     }

        //     return corbel.request.send(args);
        // };

        var buildUri = function(uri) {
            var urlBase = corbelTest.CONFIG.COMMON.urlBase.replace('{{module}}', corbel.Iam.moduleName);
            return urlBase + uri;
        };

        var getExp = function() {
            return Math.round((new Date().getTime() / 1000)) + 3500;
        };


        var getExpPlus = function() {
            return Math.round((new Date().getTime() / 1000)) + 3700;
        };

    });
});
