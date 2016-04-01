describe('In IAM module', function() {

    describe('while testing create user', function() {
        var corbelDriver;
        var userId;
        var emailDomain = '@funkifake.com';
        var user;
        var random;


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
            if(userId) {
                return corbelDriver.iam.user(userId)
                .delete()
                .should.eventually.be.fulfilled.and.notify(done);  
            } else {
                done();
            }
        });

        it('an error is returned while trying to create an user with an email that already exists', function(done) {

            corbelDriver.iam.users()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id){
                userId = id;
                user.username = user.username + emailDomain;

                return corbelDriver.iam.users()
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

        it('an error is returned while trying to create an user with an username that already exists', function(done) {

            corbelDriver.iam.users()
            .create(user)
            .should.be.eventually.fulfilled
            .then(function(id){
                userId = id;

                return corbelDriver.iam.users()
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

        it('an error [422] is returned while trying to create an user without email entity', function(done) {
            delete user.email;

            corbelDriver.iam.users()
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

        it('an error [422] is returned while trying to create an user without username entity', function(done) {
            delete user.username;

            corbelDriver.iam.users()
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

        it('an error is returned while trying to create an user with an identity that already exists', function(done) {
            user.identity = {
                    'oauthService': 'silkroad',
                    'oauthId': random
            };

            corbelDriver.iam.users()
            .create(user)
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
                random= Date.now();
                user.email = 'createUserIam.iam.' + random + emailDomain;
                user.username = 'createUserIam.iam.' + random + emailDomain;

                return corbelDriver.iam.users()
                .create(user)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'identity_exists');
            })
            .should.notify(done);
        });

        it('an error is returned while trying create an user with invalid oauth service identity', function(done) {
            user.identity = {
                    'oauthService': 'invalid',
                    'oauthId': random
            };

            corbelDriver.iam.users()
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
