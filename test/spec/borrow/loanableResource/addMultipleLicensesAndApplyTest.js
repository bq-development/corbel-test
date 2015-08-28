describe('In BORROW module, an admin can add a new resource with multiple licenses', function() {

    var timeStamp, loanableResource, loanableResourceId, resourceId;
    var license1, license2, license3, corbelDriver;

    var initData = function(timeStamp) {
        resourceId = 'resourceId_' + timeStamp;

        loanableResource = {
            resourceId: resourceId,
            asset: {
                scopes: ['assets:test'],
                name: 'assets:test'
            }
        };

        license1 = {
            availableUses: 10,
            availableLoans: 0,
            start: timeStamp - 100000,
            expire: timeStamp + 200000
        };

        license2 = {
            availableUses: 20,
            availableLoans: 20,
            start: license1.start + 1,
            expire: license1.expire + 1
        };

        license3 = {
            availableUses: 30,
            availableLoans: 30,
            start: license1.start + 2,
            expire: license1.expire + 2
        };

    };

    before(function(done) {
        timeStamp = Date.now();
        corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];

        initData(timeStamp);

        corbelDriver.borrow.resource().add(loanableResource).
        should.eventually.be.fulfilled.
        then(function(id) {
            loanableResourceId = id;
            return corbelDriver.borrow.resource(resourceId).addLicense(license1).
            should.be.eventually.fulfilled;
        }).
        then(function() {
            return corbelDriver.borrow.resource(resourceId).addLicense(license2).
            should.be.eventually.fulfilled;
        }).
        then(function() {
            return corbelDriver.borrow.resource(resourceId).addLicense(license3).
            should.be.eventually.fulfilled;
        }).
        should.notify(done);

    });

    after(function(done) {
        corbelDriver.borrow.resource(resourceId).delete().
        should.be.eventually.fulfilled.
        and.notify(done);
    });

    it('and user can apply for a loanable resource', function(done) {
        corbelDriver.borrow.resource(resourceId).get().
        should.be.eventually.fulfilled.
        then(function(results) {
            expect(results).to.have.deep.property('data.licenses').
            that.is.an('array').and.have.length(3);

            var licenses = results.data.licenses;

            expect(licenses).to.have.deep.property('[1].availableLoans', 20);
            expect(corbelTest.common.resources.checkSortingAsc(licenses, 'expire')).to.be.equal(true);

            var userId = 'anyUser_' + timeStamp;

            return corbelDriver.borrow.resource(resourceId).applyFor(userId).
            should.be.eventually.fulfilled;
        }).
        then(function() {
            return corbelDriver.borrow.resource(resourceId).get().
            should.be.eventually.fulfilled;
        }).
        then(function(results) {
            expect(results).to.have.deep.property('data.licenses').that.is.an('array');
            var licenses = results.data.licenses;

            expect(corbelTest.common.resources.checkSortingAsc(licenses, 'expire')).to.be.equal(true);
            expect(licenses).to.have.deep.property('[1].availableLoans', 19);
            expect(licenses).to.have.deep.property('[1].availableUses', 19);
        }).
        should.notify(done);
    });

});
