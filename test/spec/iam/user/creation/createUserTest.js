describe('In IAM module', function() {

    describe('while testing create user', function() {
        var corbelDriver;
        var userId;
        var random;
        var emailDomain = '@funkifake.com';
        var user;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function() {
            random = Date.now();
            user = {
                'firstName': 'createUserIam' + random,
                'email': 'createUserIam.iam.' + random + emailDomain,
                'username': 'createUserIam.iam.' + random + emailDomain,
                'scopes': ['iam:user:create', 'resources:music:read_catalog']
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

        it('basic user is created and a device is added', function(done) {
            var deviceId;

            var device = {
                notificationUri: '123',
                uid: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);

                return corbelDriver.iam.user(userId)
                .registerDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                deviceId = id;
                expect(deviceId).not.to.be.equal(undefined);
            })
            .should.notify(done);
        });

        it('basic user is created and operations over a device are made', function(done) {
            var deviceId;

            var device = {
                notificationUri: '123',
                uid: '123',
                name: 'My device',
                type: 'Android',
                notificationEnabled: true
            };

            createUser(user)
            .then(function(id) {
                userId = id;
                expect(userId).not.to.be.equal(undefined);

                return corbelDriver.iam.user(userId)
                .registerDevice(device)
                .should.eventually.be.fulfilled;
            })
            .then(function(id) {
                deviceId = id;
                expect(deviceId).not.to.be.equal(undefined);

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
            user.username = 'differentUsername' +random;

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
