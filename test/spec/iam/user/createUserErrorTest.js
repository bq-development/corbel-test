describe('In IAM module', function() {
    
    describe('while testing create user', function() {
        var corbelDriver;
        var userId;
        var domainEmail = '@funkifake.com';

        var wrongUser = {
            'firstName': 'createUserIam',
            'email': 'createUserIam.iam.',
            'username': 'createUserIam.iam.',
            'scopes': ['iam:user:create', 'resources:music:read_catalog']
        };

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        afterEach(function(done) {
            corbelDriver.iam.user(userId)
            .delete()
            .should.eventually.be.fulfilled.and.notify(done);
        });

        it('an error [409] is returned when trying to create an user with email that already exists', function(done) {
            var random = Date.now();
            var user = {
                'firstName': wrongUser.firstName + random,
                'email': wrongUser.email + random + domainEmail,
                'username': wrongUser.username + random + domainEmail
            };

            corbelDriver.iam.user()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id){
                userId = id;
                user.username = wrongUser.username + domainEmail;

                return corbelDriver.iam.user()
                .create(user)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'entity_exists');
                expect(e).to.have.deep.property('data.errorDescription', 'email duplicated');
            })
            .should.notify(done);
        });

        it('an error is returned when trying to create an user with username that already exists', function(done) {
            var random = Date.now();
            var user = {
                'firstName': wrongUser.firstName + random,
                'email': wrongUser.email + random + domainEmail,
                'username': wrongUser.username + random + domainEmail
            };

            corbelDriver.iam.user()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id){
                userId = id;

                return corbelDriver.iam.user()
                .create(user);
            })
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'entity_exists');
                expect(e).to.have.deep.property('data.errorDescription', 'username duplicated');
            }).
            should.notify(done);
        });

        it('an error [422] is returned when trying to create an user without email entity', function(done) {

            corbelDriver.iam.user()
            .create({
                'firstName': 'firstname',
                'username': 'username'
            })
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [422] is returned when trying to create an user without username entity', function(done) {

            corbelDriver.iam.user()
            .create({
                'firstName': 'firstname',
                'email': 'email@funkifake.com'
            })
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error [403] is returned when trying to create an user with invalid scopes entity', function(done) {
            corbelDriver.iam.user().create({
                'firstName': 'xxx',
                'email': 'xxx.xxx' + domainEmail,
                'username': 'xxx.xxx' + domainEmail,
                'scopes': ['iam:user:xxx', 'resources:music:streaming']
            })
            .should.eventually.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'scopes_not_allowed');
            })
            .should.notify(done);
        });

        it('an error is returned when trying to create an user with an identity that already exists', function(done) {
            var randomUser = Date.now();
            var randomOauth = Date.now();

            var user = {
                'firstName': wrongUser.firstName,
                'email': wrongUser.email + randomUser + domainEmail,
                'username': wrongUser.username + randomUser + domainEmail,
                'identity': {
                    'oauthService': 'silkroad',
                    'oauthId': randomOauth
                }
            };

            corbelDriver.iam.user()
            .create(user)
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
                randomUser = Date.now();
                user.email = wrongUser.email + randomUser + domainEmail;
                user.username = wrongUser.username + randomUser + domainEmail;

                return corbelDriver.iam.user()
                .create(user)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'identity_exists');
            })
            .should.notify(done);
        });

        it('an error is returned when trying create an user with invalid oauth service identity', function(done) {

            var random = Date.now();
            var user = {
                'firstName': wrongUser.firstName,
                'email': wrongUser.email + random + domainEmail,
                'username': wrongUser.username + random + domainEmail,
                'identity': {
                    'oauthService': 'vk',
                    'oauthId': random
                }
            };

            corbelDriver.iam.user()
            .create(user)
            .should.eventually.be.rejected.
            then(function(e) {
                  expect(e).to.have.property('status', 400);
                  expect(e).to.have.deep.property('data.error', 'invalid_oauth_service');
            })
            .should.notify(done); 
        });
    });
});
