describe('In IAM module', function() {

    describe('while testing disconnect', function() {
        var corbelRootDriver;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('an error [404] is returned while trying to disconnect an unexistent user', function(done) {
            corbelRootDriver.iam.user('unexistent')
            .disconnect()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error [401] is returned while trying to disconnect a non logged user using "me"', function(done) {
            corbelRootDriver.iam.user('me')
            .disconnect()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error [401] is returned while trying to disconnect a non logged user using disconnectMe', function(done) {
            corbelRootDriver.iam.user()
            .disconnectMe()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error [401] is returned while trying to disconnect a non logged user', function(done) {
            corbelRootDriver.iam.user('me')
            .disconnect()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });
});
