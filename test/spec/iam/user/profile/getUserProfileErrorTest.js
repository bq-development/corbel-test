describe('In IAM module', function() {

    describe('while testing get user profile', function() {
        var corbelDriver;
        var corbelRootDriver;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('an error is returned while trying to get a profile with unauthorized driver using "me"', function(done) {

            corbelRootDriver.iam.user('me')
            .getProfile()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error is returned while trying to get an unexistent user profile', function(done) {

            corbelRootDriver.iam.user('unexistent')
            .getProfile()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
