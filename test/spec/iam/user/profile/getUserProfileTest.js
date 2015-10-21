describe('In IAM module', function() {

    describe('while testing get user profile', function() {
        var corbelRootDriver;
        var corbelDriver;
        var user;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone(); 
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a user profile is got through id and admin driver', function(done) {

            corbelRootDriver.iam.user(user.id)
            .getProfile()
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', user.username);
                expect(response).to.have.deep.property('data.firstName', user.firstName);
                expect(response).to.have.deep.property('data.lastName', user.lastName);
                expect(response).to.have.deep.property('data.email', user.email.toLowerCase());
            }).
            should.notify(done);
        });

        it('a user profile is got through "me"', function(done) {

            corbelDriver.iam.user('me')
            .getProfile()
            .then(function(response) {
                expect(response).to.have.deep.property('data.username', user.username);
                expect(response).to.have.deep.property('data.firstName', user.firstName);
                expect(response).to.have.deep.property('data.lastName', user.lastName);
                expect(response).to.have.deep.property('data.email', user.email.toLowerCase());
            }).
            should.notify(done);
        });

        it('all users profile are got through default driver', function(done) {
            var user2;

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user2 = createdUsers[0];

                return corbelDriver.iam.users()
                .getProfiles()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.length').and.be.above(1);
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
        it('all users profile are got through admin driver', function(done) {

            var user2;

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user2 = createdUsers[0];

                return corbelRootDriver.iam.users()
                .getProfiles()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.length').and.be.above(1);
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(user2.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a user profile is got through admin driver and a query using equal', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        'firstName': user.firstName
                    }
                }]
            };

            corbelRootDriver.iam.users()
            .getProfiles(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 1);
            })
            .should.notify(done);
        });

        it('a user is got through admin driver and a query using equal (user does not exists)', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        'firstName': 'unexistent'
                    }
                }]
            };

            corbelRootDriver.iam.users()
            .getProfiles(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('a user is got through admin driver and a query using like', function(done) {
            var params = {
                query: [{
                    '$like': {
                        'firstName': user.firstName
                    }
                }]
            };

            corbelRootDriver.iam.users()
            .getProfiles(params)
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.length').and.to.be.above(0);
            })
            .should.notify(done);
        });

        it('users are got especifying page and pageSize', function(done) {
            var users;
            var params = {
                pagination: {
                    page: 2,
                    pageSize: 5
                }
            };

            corbelTest.common.iam.createUsers(corbelDriver, 10)
            .should.be.eventually.fulfilled
            .then(function(response){
                users = response;
                return corbelRootDriver.iam.users()
                .getProfiles(params)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.length', 5);
            })
            .then(function() {
                var promises = []; 
                users.forEach(function(currentUser){
                     promises.push(corbelRootDriver.iam.user(currentUser.id)
                    .delete()
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelRootDriver.iam.user(currentUser.id)
                        .get()
                        .should.be.eventually.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    }));
                });
                return Promise.all(promises);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
