describe('In IAM module', function() {

    describe('while testing signOut', function() {
        var corbelRootDriver;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('an error [401] is returned while trying to signOut a non logged user using "me"', function(done) {
            corbelRootDriver.iam.user('me')
            .signOut()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error [401] is returned while trying to signOut a non logged user using user()', function(done) {
            corbelRootDriver.iam.user('me')
            .signOut()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });
    });
});
