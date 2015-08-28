describe('In BORROW module, when a user reservers multiple resources', function() {

    var corbelDriverAdmin, corbelDriverUser, createdUserId;
    var resourcesIdOnLoanableResources, createdLoanableResources;
    var amount = 5;
    var availableLoans = 0;

    function bookForResourcesLoanables(corbelDriver, userId) {
        var promises = [];

        resourcesIdOnLoanableResources.forEach(function(loanableResourceId) {
            var promise = corbelDriver.borrow.resource(loanableResourceId).reserveFor(userId);
            promises.push(promise);
        });
        return Promise.all(promises);
    }

    before(function(done) {
        corbelDriverAdmin = corbelTest.drivers['ADMIN_CLIENT'];
        corbelDriverUser = corbelTest.drivers['DEFAULT_CLIENT'];

        var userName = 'randomUser_' + Date.now();

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
        then(function() {
            return bookForResourcesLoanables(corbelDriverAdmin, createdUserId).
            should.be.eventually.fulfilled;
        }).
        should.notify(done);
    });

    after(function(done) {
        corbelTest.common.borrow.
        cleanResourcesLoanables(corbelDriverAdmin, resourcesIdOnLoanableResources).
        should.be.eventually.fulfilled.
        then(function() {
            return corbelDriverAdmin.iam.user(createdUserId).signOut().
            should.be.eventually.fulfilled;
        }).
        then(function() {
            return corbelDriverAdmin.iam.user(createdUserId).delete().
            should.be.eventually.fulfilled;
        }).
        should.notify(done);
    });

    it('admin can get them and is returned status OK (200)', function(done) {
        corbelDriverAdmin.borrow.user(createdUserId).getAllReservations().
        should.eventually.be.fulfilled.
        then(function(response) {
            expect(response).to.have.property('data').
            and.be.an('array').and.have.length(amount);
        }).
        should.notify(done);
    });

    it('user can get them and is returned status OK (200)', function(done) {
        corbelDriverUser.borrow.user(createdUserId).getAllReservations().
        should.eventually.be.fulfilled.
        then(function(response) {
            expect(response).to.have.property('data').
            and.be.an('array').and.have.length(amount);
        }).
        should.notify(done);
    });

});
