describe('In IAM module', function() {

    describe('while testing disconnect', function() {
        var corbelDriver;
        var corbelRootDriver;
        var userId;
        var random;
        var username;
        var password;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            random = Date.now();
            username = 'user.signOut' + random + '@funkifake.com';
            password = 'passSignOut';

            corbelDriver.iam.users()
            .create({
                'firstName': 'usersignOut',
                'lastName': 'usersignOut2',
                'email': 'user.signOut' + random + '@funkifake.com',
                'username': username,
                'password': password
            })
            .should.be.eventually.fulfilled
            .then(function(id) {
                userId = id;

                return corbelTest.common.clients.loginUser(corbelDriver, username, password)
                .should.eventually.be.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function(response) {
                expect(response).to.have.property('status', 404);
                expect(response).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('the logged user is disconnected using "me"', function(done) {
            corbelDriver.iam.user('me')
            .get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', userId);

                return corbelDriver.iam.user('me')
                .disconnect()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('the logged user is disconnected', function(done) {
            corbelDriver.iam.user()
            .get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', userId);

                return corbelDriver.iam.user()
                .disconnect()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user()
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an admin user can disconnect a logged user', function(done) {
            corbelDriver.iam.user('me')
            .get()
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', userId);

                return corbelRootDriver.iam.user(userId)
                .disconnect()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });
    });
});
