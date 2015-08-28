describe('In BORROW module when lenders have maximum concurrent loans per user configuration', function() {

    var amount = 7;
    var createdLoanableResources, resourcesIdOnLoanableResources, createdUserId;
    var availableLoans = 5;
    var timeStamp, corbelDriverAdmin, corbelDriverUser;

    function applyResourcesLoanables(corbelDriver, userId) {
        var promises = [];
        resourcesIdOnLoanableResources.forEach(function(resourceId) {
            promises.push(corbelDriver.borrow.resource(resourceId).applyFor(userId));
        });
        return Promise.all(promises);
    }

    before(function(done) {
        timeStamp = Date.now();

        var userName = 'randomUser_' + timeStamp;
        var userPassword = 'sdjnaeosanrfoaej';

        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'];
        corbelDriverUser = corbelTest.drivers['DEFAULT_CLIENT'];

        var idsAndLoanableResources = corbelTest.common.borrow
            .createLoanableResources(corbelDriverAdmin, amount, availableLoans);

        resourcesIdOnLoanableResources =
            idsAndLoanableResources.resourcesIdOnLoanableResources;

        idsAndLoanableResources.createdLoanableResources.
        should.eventually.be.fulfilled.
        then(function(createdLoanableResourcesFromPromise) {
            createdLoanableResources = createdLoanableResourcesFromPromise;

            return corbelTest.common.iam.createUsers(corbelDriverAdmin, 1).
            should.eventually.fulfilled;
        }).
        then(function(users) {
            expect(users).to.be.an('array').and.have.length(1);
            expect(users).to.have.deep.property('[0].id.data');
            expect(users).to.have.deep.property('[0].username');
            expect(users).to.have.deep.property('[0].password');
            createdUserId = users[0].id.data;

            return corbelDriverUser.iam.token().create({
                claims: {
                    'basic_auth.username': users[0].username,
                    'basic_auth.password': users[0].password
                }
            }).
            should.be.eventually.fulfilled;
        }).
        should.notify(done);
    });

    after(function(done) {
        corbelTest.common.borrow.cleanResourcesLoanables(corbelDriverAdmin, createdLoanableResources);

        corbelDriverAdmin.iam.user(createdUserId).delete().
        should.be.eventually.fulfilled.
        and.notify(done);
    });

    it('and when user loans limit is reached, fails to apply returning status (409) ', function(done) {
        applyResourcesLoanables(corbelDriverUser, createdUserId).
        should.eventually.be.rejected.
        then(function(e) {
            expect(e).to.have.property('status', 409);
            expect(e).to.have.deep.property('data.error', 'conflict');
        }).
        should.notify(done);
    });

});
