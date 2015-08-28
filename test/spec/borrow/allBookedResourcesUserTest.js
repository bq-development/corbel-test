describe('In BORROW module, when a user reservers multiple resources', function() {

    var corbelDriverAdmin, corbelDriverUser, createdUserId;
    var userTestIdentifier, resourcesIdOnLoanableResources, createdLoanableResources;
    var amount = 5;
    var availableLoans = 0;

    function bookForResourcesLoanables(corbelDriver, userId) {
        var promises = [];

        resourcesIdOnLoanableResources.forEach(function(loanableResourceId) {
            var promise = corbelDriver.borrow.resource(loanableResourceId).reserveFor(userId);
            promises.push(promise);
        });
        return q.all(promises);
    }

    before(function(done) {
        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'];

        var userName = 'randomUser_' + Date.now();
        var userPassword = 'skjldafaslkfj';

        var idsAndLoanableResources = corbelTest.common.borrow
            .createLoanableResources(corbelDriverAdmin, amount, availableLoans);

        resourcesIdOnLoanableResources =
            idsAndLoanableResources.resourcesIdOnLoanableResources;

        idsAndLoanableResources.createdLoanableResources.
        should.eventually.be.fulfilled.
        then(function(createdLoanableResourcesFromPromise) {
            createdLoanableResources = createdLoanableResourcesFromPromise;

            return corbelTest.common.utils.createNewUser(corbelDriverAdmin, userName, userPassword).
            should.eventually.fulfilled;
        }).
        then(function(id) {
            userTestIdentifier = id;

            return corbelTest.common.utils.loginUser(corbelDriverAdmin, userName, userPassword).
            should.be.eventually.fulfilled;
        }).
        then(function() {
            return bookForResourcesLoanables(corbelDriverAdmin, userTestIdentifier).
            should.be.eventually.fulfilled;
        }).
        should.notify(done);
    });

    after(function(done) {
        corbelTest.common.borrow.
        cleanResourcesLoanables(corbelDriverAdmin, resourcesIdOnLoanableResources).
        should.be.eventually.fulfilled.
        then(function() {
            return corbelDriverAdmin.iam.user(createdUserId).delete().
            should.be.eventually.fulfilled;
        }).
        should.notify(done);
    });

    it.skip('admin can get them and is returned status OK (200)', function(done) {
        corbelDriverAdmin.borrow.user(userTestIdentifier).getAllReservations().
        should.eventually.be.fulfilled.
        then(function(data) {
            expect(data).to.have.property('length', amount);
        }).
        should.notify(done);
    });

});
