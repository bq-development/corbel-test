describe('In BORROW module when lenders have maximum concurrent loans per user configuration', function() {

    var amount = 7;
    var createdLoanableResources;
    var resourcesIdOnLoanableResources;
    var userTestIdentifier;
    var availableLoans = 5;
    var timeStamp, corbelDriverAdmin, corbelDriverUser;

    function applyResourcesLoanables(corbelDriver, userId) {
        var promises = [];
        resourcesIdOnLoanableResources.forEach(function(resourceId) {
            promises.push(corbelDriver.borrow.resource(resourceId).applyFor(userId));
        });
        return q.all(promises);
    }

    before(function(done) {
        timeStamp = Date.now();

        var userName = 'randomUser_' + timeStamp;
        var userPassword = 'sdjnaeosanrfoaej';

        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'];

        var idsAndLoanableResources = corbelTest.common.borrow
            .createLoanableResources(corbelDriverAdmin, amount, availableLoans);

        resourcesIdOnLoanableResources =
            idsAndLoanableResources.resourcesIdOnLoanableResources;

        idsAndLoanableResources.createdLoanableResources.
        should.eventually.be.fulfilled.
        then(function(createdLoanableResourcesFromPromise) {
            createdLoanableResources = createdLoanableResourcesFromPromise;

            return corbelTest.common.utils.createNewUser(corbelDriverAdmin, userName, userPassword).
            should.be.eventually.fulfilled;
        }).
        then(function(id) {
            userTestIdentifier = id;

            return corbelTest.common.utils.loginUser(corbelDriverAdmin, userName, userPassword).
            should.be.eventually.fulfilled;
        }).
        then(function(response) {
            corbelDriverUser = response;
        }).
        should.notify(done);
    });

    after(function(done) {
        corbelTest.common.borrow.cleanResourcesLoanables(corbelDriverAdmin, createdLoanableResources);

        corbelDriverAdmin.iam.user(userTestIdentifier).delete().
        should.be.eventually.fulfilled.
        and.notify(done);
    });

    it.skip('and when user loans limit is reached, fails to apply returning status (409) ', function(done) {
        applyResourcesLoanables(corbelDriverUser, userTestIdentifier).
        should.eventually.be.rejected.
        then(function(e) {
            expect(e).to.have.property('httpStatus', 409);
            expect(e).to.have.property('error', 'conflict');
        }).
        should.notify(done);
    });

});
