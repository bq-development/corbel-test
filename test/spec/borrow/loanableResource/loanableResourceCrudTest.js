describe('In BORROW module', function() {

    it('a loanable resource can be created, consulted, updated, and deleted', function(done) {
        var corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];

        var loanableResource = {
            resourceId: 'resourceId_' + Date.now(),
            asset: {
                scopes: ['assets:test'],
                name: 'assetTest',
                period: 'P0D'
            }
        };

        corbelDriver.borrow.resource().
        add(loanableResource).
        should.eventually.be.fulfilled.
        then(function() {
            return corbelDriver.borrow.resource(loanableResource.resourceId).
            get().
            should.be.eventually.fulfilled;
        }).
        then(function(response) {
            expect(response).to.have.
            deep.property('data.resourceId', loanableResource.resourceId);

            return corbelDriver.borrow.resource(loanableResource.resourceId).
            delete().
            should.be.eventually.fulfilled;
        }).
        then(function() {
            return corbelDriver.borrow.resource(loanableResource.resourceId).
            get().
            should.be.eventually.rejected;
        }).
        then(function(response) {
            expect(response).to.have.property('status', 404);
            expect(response).to.have.
            deep.property('data.error', 'not_found');
        }).
        should.notify(done);
    });

});
