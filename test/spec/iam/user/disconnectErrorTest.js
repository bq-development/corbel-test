describe('In IAM module', function() {

    describe('while testing disconnect', function() {
        var corbelRootDriver;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('an error [401] is returned while trying to disconnect an unexistent user', function(done) {
            corbelRootDriver.iam.user('unexistent')
            .disconnect()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
