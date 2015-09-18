describe('In IAM module', function() {

    describe('while testing delete me', function() {
        var corbelDriver;
        var userId;
        var random;
        var emailDomain = '@funkifake.com';
        var deleteUserMe = {
            'firstName': 'userDeleteMe',
            'lastName': 'userDeleteMe',
            'email': 'user.deleteMe',
            'username': 'user.deleteMe',
            'password': 'passDeleteMe'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            var random = Date.now();

            corbelDriver.iam.user()
            .create({
                'firstName': deleteUserMe.firstName,
                'lastName': deleteUserMe.lastName,
                'email': deleteUserMe.email + random + emailDomain,
                'username': deleteUserMe.username + random + emailDomain,
                'password': deleteUserMe.password,
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;

                return corbelTest.common.clients.loginUser
                    (corbelDriver, deleteUserMe.username + random + emailDomain, deleteUserMe.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        it('an error is returned while trying to get user with the same driver after use deleteMe', function(done) {

            corbelDriver.iam.user()
            .deleteMe()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e){
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        describe('When request delete me with client token ', function() {

            before(function(done) {
                app.session.destroy();
                var getExp = function() {
                    return Math.round((new Date().getTime() / 1000)) + 3500;
                };

                expect(iam.token().create({
                    jwt: jwt.generate({
                            iss: app.common.get('clientId'),
                            scope: app.common.get('clientScopes'),
                            aud: 'http://iam.bqws.io',
                            exp: getExp()
                        },
                        app.common.get('clientSecret'),
                        app.common.get('jwtAlgorithm'))
                    })).to.eventually.be.fulfilled.
                    then(function(response) {
                        app.session.add('accessToken', response.accessToken);
                    }).
                    should.notify(results.to(done));
            });


            after(function() {
                app.session.destroy();
            });
            it('failed returning error AUTHORIZATED(401)', function(done) {
                var promise = iam.user().deleteMe();
                expect(promise).to.eventually.be.rejected.
                then(function(e) {
                    expect(e).to.have.property('httpStatus', 401);
                    expect(e).to.have.property('error', 'authorizated');
                }).
                should.notify(results.to(done));
            });
        });
    });
});
