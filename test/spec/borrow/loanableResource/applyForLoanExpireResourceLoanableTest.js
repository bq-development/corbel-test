describe('In BORROW module, if a loanable resource expires', function() {

    var timeStamp, loanableResource, corbelDriver;

    before(function(done) {
        corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];

        timeStamp = Date.now();

        loanableResource = {
            resourceId: 'resourceId_' + timeStamp,
            asset: {
                scopes: ['assets:test'],
                name: 'assetTest',
                period: 'P0D'
            }
        };

        corbelDriver.borrow.resource().add(loanableResource).
        should.be.eventually.fulfilled.
        and.notify(done);
    });

    after(function(done) {
        corbelDriver.borrow.resource(loanableResource.resourceId).delete().
        should.be.eventually.fulfilled.
        and.notify(done);
    });

    it('and is tried to loan it, fails returning status "conflict" (409)', function(done) {

        corbelDriver.borrow.resource(loanableResource.resourceId).get().
        should.be.eventually.fulfilled.
        then(function(response) {
            expect(response).to.have.
            deep.property('data.resourceId', loanableResource.resourceId);

            var userId = 'anyUser_' + timeStamp;

            return corbelDriver.borrow.resource(loanableResource.resourceId).
            applyFor(userId).
            should.be.eventually.rejected;
        }).
        then(function(response) {
            expect(response).to.have.property('status', 409);
            expect(response).to.have.
            deep.property('data.error', 'conflict');
        }).
        should.notify(done);

    });

});
