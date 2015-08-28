describe('In BORROW module, with the lender API', function() {

    var corbelDriver, resourceIdValue;

    before(function(done) {
        corbelDriver = corbelTest.drivers['ROOT_CLIENT'];

        var timeStamp = Date.now();
        resourceIdValue = 'resourceId_' + timeStamp;

        var loanableResource = {
            resourceId: resourceIdValue,
            licenses: [{
                availableUses: 100,
                availableLoans: 0,
                start: timeStamp - 100000,
                expire: timeStamp + 100000
            }],
            asset: {
                scopes: ['assets:test'],
                name: 'assets:test',
                period: 'P0D'
            }
        };

        corbelDriver.borrow.resource().add(loanableResource).
        should.eventually.be.fulfilled.
        then(function() {
            return corbelDriver.borrow.resource(resourceIdValue).applyFor('anyUser').
            should.be.eventually.rejected;
        }).
        then(function() {
            var promises = [];

            for (var i = 0; i < 5; ++i) {
                promises.push(corbelDriver.borrow.resource(resourceIdValue).reserveFor('anyUser' + i));
            }

            return Promise.all(promises).
            should.be.eventually.fulfilled;
        }).
        should.notify(done);
    });

    it('can be consulted all reservations', function(done) {
        var params = {
            query: [{
                '$eq': {
                    resourceId: resourceIdValue
                }
            }]
        };

        corbelDriver.borrow.lender().getAllReservations(params).
        should.be.eventually.fulfilled.
        then(function(reservations) {
            expect(reservations).to.have.deep.property('data.length', 5);
        }).
        should.notify(done);
    });

});
