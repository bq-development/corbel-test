describe('In IAM module', function() {

    describe('while testing updateMe', function() {
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
            username = 'user.updateMe' + random + '@funkifake.com';
            password = 'passUpdateMe';

            corbelDriver.iam.users()
            .create({
                'firstName': 'userUpdateMe',
                'lastName': 'userUpdateMe',
                'email': 'user.updateMe' + random + '@funkifake.com',
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

        it('user firsname is updated through updateMe', function(done) {
            corbelDriver.iam.user()
            .updateMe({
                'firstName': 'user Modified Me'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName','user Modified Me');
            })
            .should.notify(done);
        });

        it('user firsname and lastname are updated through updateMe', function(done) {
            corbelDriver.iam.user()
            .updateMe({
                'firstName': 'user Modified Me',
                'lastName': 'new lastName'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.firstName','user Modified Me');
                expect(response).to.have.deep.property('data.lastName','new lastName');
            })
            .should.notify(done);
        });

        it('user username is updated through updateMe', function(done) {
            corbelDriver.iam.user()
            .updateMe({
                'username': 'modified username'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.username','modified username');
            })
            .should.notify(done);
        });

        it('user email is updated through updateMe', function(done) {
            var newEmail = 'modifiedemail@funkifake.com';
            corbelDriver.iam.user()
            .updateMe({
                'email': newEmail
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.email', newEmail);
            })
            .should.notify(done);
        });

        it('user scopes are not updated through updateMe', function(done) {
            corbelDriver.iam.user()
            .updateMe({
                'scopes': ['ec:purchase:admin']
            })
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelRootDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response.data.scopes).not.to.include('ec:purchase:admin');
            })
            .should.notify(done);
        });
    });
});
