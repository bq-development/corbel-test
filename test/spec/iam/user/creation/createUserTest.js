describe('In IAM module', function() {

    describe('while testing create user', function() {
        var corbelDriver;
        var userId;
        var random;
        var emailDomain = '@funkifake.com';
        var user;
        var domainId = corbelTest.CONFIG.DOMAIN;
        var domainDefaultScopes;

        before(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelTest.drivers['ROOT_CLIENT'].clone()
                .iam.domain(domainId)
                .get()
                .then(function(domain){
                    domainDefaultScopes = domain.data.defaultScopes;
                })
                .should.notify(done);
        });

        beforeEach(function() {
            random = Date.now();
            user = {
                'firstName': 'createUserIam' + random,
                'email': 'createUserIam.iam.' + random + emailDomain,
                'username': 'createUserIam.iam.' + random + emailDomain
            };
        });

        afterEach(function(done) {
            corbelDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        var createUser = function(user){
            return corbelDriver.iam.users()
            .create(user)
            .should.eventually.be.fulfilled;
        };

        it('basic user is created', function(done) {
            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);
            })
            .should.notify(done);
        });

        it('basic user is created with phone number as username', function(done) {

            user.username = Date.now().toString().substr(4);

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);

                return corbelDriver.iam.user(userId)
                    .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', user.username);
                expect(response.data.scopes).to.eql(domainDefaultScopes);
            })
            .should.notify(done);
        });

        it('user is created and ignore scopes', function(done) {
            user.scopes = ['testScope'];
            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);

                return corbelDriver.iam.user(userId)
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data.scopes).to.eql(domainDefaultScopes);
            })
            .should.notify(done);
        });

        it('basic user is created and a device is added', function(done) {
            var deviceId = '123';

            var device = {
                notificationUri: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);

                return corbelDriver.iam.user(userId)
                .registerDevice(deviceId, device)
                .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                expect(deviceId).to.be.equal(id);
            })
            .should.notify(done);
        });

        it('basic user is created and operations over a device are made', function(done) {
            var deviceId = '123';

            var device = {
                notificationUri: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);

                return corbelDriver.iam.user(userId)
                .registerDevice(deviceId, device)
                .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                expect(deviceId).to.be.equal(id);

                return corbelDriver.iam.user(userId)
                .getDevice(deviceId)
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', deviceId);

                return corbelDriver.iam.user(userId)
                .deleteDevice(deviceId)
                .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                return corbelDriver.iam.user(userId)
                .getDevice(deviceId)
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('basic user is created with differences between email and username', function(done) {
            user.username = 'differentUsername' + random;

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);
            })
            .should.notify(done);
        });

        it('user with silkroad identity is created', function(done) {
            user.identity = {
                    'oauthService': 'silkroad',
                    'oauthId': random
            };

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);
            }).
            should.notify(done);
        });

        it('user with facebook identity is created', function(done) {
            user.identity = {
                    'oauthService': 'facebook',
                    'oauthId': random
            };

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);
            })
            .should.notify(done);
        });

        it('user with google identity is created', function(done) {
            user.identity = {
                    'oauthService': 'google',
                    'oauthId': random
            };

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);
            })
            .should.notify(done);
        });
    });
});
