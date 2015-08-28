/* jshint multistr: true */
describe('In BORROW module, when creating a loanable resource', function() {

    var corbelDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];
    });

    it('without "expire" attribute in a license, fails with "unprocessable\
        entity" error message (422)', function(done) {

        var timeStamp = Date.now();

        var loanableResource = {
            resourceId: 'resourceId_' + timeStamp,
            asset: {
                scopes: ['assets:test'],
                name: 'assetTest',
                period: 'P0D'
            },
            licenses: [{
                availableUses: 100,
                availableLoans: 100,
                start: timeStamp - 100000
            }]
        };

        corbelDriver.borrow.resource().
        add(loanableResource).
        should.be.eventually.rejected.
        then(function(response) {
            expect(response).to.have.property('status', 422);
        }).
        should.notify(done);
    });

    it('with "licenses" attribute as null, fails with "unprocessable\
        entity" error message (422)', function(done) {

        var timeStamp = Date.now();

        var loanableResource = {
            resourceId: 'resourceId_' + timeStamp,
            asset: {
                scopes: ['assets:test'],
                name: 'assetTest',
                period: 'P0D'
            },
            licenses: null
        };

        corbelDriver.borrow.resource().
        add(loanableResource).
        should.be.eventually.rejected.
        then(function(response) {
            expect(response).to.have.property('status', 422);
        }).
        should.notify(done);
    });

    it('with "licenses" attribute empty, successes with "created" message (201)',
        function(done) {

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
        should.be.eventually.fulfilled.
        and.notify(done);
    });

    it('with invalid value in "licenses" attribute, fails with "unprocessable\
        entity" error message (422)', function(done) {

        var loanableResource = {
            resourceId: 'resourceId_' + Date.now(),
            asset: {
                scopes: ['assets:test'],
                name: 'assetTest',
                period: 'P0D'
            },
            licenses: 'jksdflksj'
        };

        corbelDriver.borrow.resource().
        add(loanableResource).
        should.be.eventually.rejected.
        then(function(response) {
            expect(response).to.have.property('status', 422);
        }).
        should.notify(done);
    });

});
