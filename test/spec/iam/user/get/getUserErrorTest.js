describe('In IAM module', function() {

    describe('while testing get user', function() {
        var corbelDriver;
        var corbelRootDriver;
        var random;
        var userId = Date.now();
        var emailDomain = '@funkifake.com';

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('an error is returned while trying to get a user with unauthorized driver using "me"', function(done) {

            corbelRootDriver.iam.user('me')
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to get a user with unauthorized driver using id', function(done) {

            corbelDriver.iam.user(userId)
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to get a nonexistent user', function(done) {

            corbelRootDriver.iam.user('nonexistent')
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to get all users with unauthorized driver', function(done) {

            corbelDriver.iam.user()
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });
    });
});
