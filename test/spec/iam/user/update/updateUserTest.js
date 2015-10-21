describe('In IAM module', function() {

    describe('while testing update user', function() {
        var corbelDriver;
        var user;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'];
        });

        beforeEach(function(done) {

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.eventually.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.iam.user(user.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('user firstName is updated', function(done) {

            corbelDriver.iam.user(user.id)
            .update({
                'firstName': 'user Modified'
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.firstName', 'user Modified');
            }).
            should.notify(done);
        });

        it('user username is updated', function(done) {
            var newUserName = 'NewUserName' + Date.now();

            corbelDriver.iam.user(user.id)
            .update({
                'username': newUserName
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.username', newUserName);
            })
            .should.notify(done);
        });

        it('user email is updated', function(done) {
            var newEmail = 'newemail' + Date.now() + '@funkifake.com';

            corbelDriver.iam.user(user.id)
            .update({
                'email': newEmail
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.email', newEmail);
            })
            .should.notify(done);
        });

        it('user scopes are updated', function(done) {

            corbelDriver.iam.user(user.id)
            .update({
                'scopes': ['iam:user:delete']
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.scopes.length', 1);
                expect(user).to.have.deep.property('data.scopes').and.to.include('iam:user:delete');
            })
            .should.notify(done);
        });

        it('user is updated without new content', function(done) {

            corbelDriver.iam.user(user.id)
            .update()
            .should.eventually.be.fulfilled.and.notify(done);
        });
    });
});
