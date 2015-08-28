describe('In BORROW module', function() {

    var corbelAdminDriver, corbelUserDriver, resourceId, loanableResource;

    function initData(timeStamp) {
        resourceId = 'resourceId_' + timeStamp;
        loanableResource = {
            resourceId: resourceId,
            licenses: [{
                availableUses: 100,
                availableLoans: 5,
                start: Date.now() - 100000,
                expire: Date.now() + 100000
            }],
            asset: {
                scopes: ['assets:test'],
                name: 'assets:test',
                period: 'P0D'
            }
        };
    }

    before(function() {
        corbelAdminDriver = corbelTest.drivers['ADMIN_CLIENT'];
        corbelUserDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    describe('when adding a loanable resource with valid license and applying', function() {

        beforeEach(function(done) {
            initData(Date.now());

            corbelAdminDriver.borrow.resource().add(loanableResource).
            should.eventually.be.fulfilled.
            and.notify(done);
        });

        afterEach(function(done) {
            corbelAdminDriver.borrow.resource(resourceId).delete().
            should.eventually.be.fulfilled.
            and.notify(done);
        });

        it('successes returning status OK (200)', function(done) {
            var userId = 'anyUser_' + Date.now();

            corbelAdminDriver.borrow.resource(resourceId).applyFor(userId).
            should.be.eventually.fulfilled.
            then(function() {
                return corbelAdminDriver.borrow.resource(resourceId).getLentOf(userId).
                should.be.eventually.fulfilled;
            }).
            then(function(loanedResource) {
                expect(loanedResource).to.have.property('userId', userId);
            }).
            should.notify(done);
        });

        it('if done two times, fails returning status CONFLICT (409)', function(done) {
            var userId = 'anyUser_' + Date.now();

            corbelAdminDriver.borrow.resource(resourceId).applyFor(userId).
            should.eventually.be.fulfilled.
            then(function() {
                return borrow.resource(resourceId).getLentOf(userId).
                should.be.eventually.fulfilled;
            }).
            then(function(loanedResource) {
                expect(loanedResource).to.have.property('userId', userId);

                return corbelAdminDriver.borrow.resource(resourceId).applyFor(userId).
                should.be.eventually.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.property('error', 'conflict');
            }).
            should.notify(done);
        });

        it('if done with my logged user, success returning status OK (200)', function(done) {
            userUtils.createNewUserAndLogged().
            should.eventually.fulfilled.
            then(function() {
                return corbelUserDriver.borrow.resource(resourceId).applyForMe().
                should.eventually.be.fulfilled;
            }).
            then(function() {
                return corbelUserDriver.borrow.resource(resourceId).getMyLent().
                should.eventually.be.fulfilled;
            }).
            then(function(loanedResource) {
                expect(loanedResource.userId).to.be.equals(app.session.get('user').id);
            }).
            should.notify(done);
        });

        it('if done with my logged user two times, successes returning status CONFLICT (409)', function(done) {
            userUtils.createNewUserAndLogged().
            should.eventually.fulfilled.
            then(function() {
                return corbelUserDriver.borrow.resource(resourceId).applyForMe().
                should.eventually.be.fulfilled;
            }).
            then(function() {
                return corbelUserDriver.borrow.resource(resourceId).getMyLent().
                should.eventually.be.fulfilled;
            }).
            then(function(loanedResource) {
                expect(loanedResource.userId).to.be.equals(app.session.get('user').id);

                return corbelUserDriver.borrow.resource(resourceId).applyForMe().
                should.eventually.be.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.property('error', 'conflict');
            }).
            should.notify(done);
        });

    });

    describe('when a user applies for a loanable resource with an invalid license', function() {
        beforeEach(function() {
            initData();
        });

        afterEach(function(done) {
            app.session.destroy();
            functionUtils.loadAdminClient();

            corbelAdminDriver.borrow.resource(resourceId).delete().
            should.be.eventually.fulfilled.
            and.notify(done);
        });


        it('and the available uses are 0, fails returning status CONFLICT (409)', function(done) {
            var userId = 'anyUser_' + Date.now();
            loanableResource.licenses[0].availableUses = 0;

            corbelAdminDriver.borrow.resource().add(loanableResource).
            should.eventually.be.fulfilled.
            then(function() {
                return corbelAdminDriver.borrow.resource(resourceId).applyFor(userId).
                should.be.eventually.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.property('error', 'conflict');
            }).
            should.notify(done);
        });

        it('and the available loans are 0, fails returning status CONFLICT (409)', function(done) {
            var userId = 'anyUser_' + Date.now();
            loanableResource.licenses[0].availableLoans = 0;

            corbelAdminDriver.borrow.resource().add(loanableResource).
            should.be.eventually.fulfilled.
            then(function() {
                return corbelAdminDriver.borrow.resource(resourceId).applyFor(userId).
                should.be.eventually.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.property('error', 'conflict');
            }).
            should.notify(done);
        });

        it('and the license starts in the future, fails returning status CONFLICT (409)', function(done) {
            var timeStamp = Date.now();
            var userId = 'anyUser_' + timeStamp;
            loanableResource.licenses[0].start = timeStamp + 100000;

            corbelAdminDriver.borrow.resource().add(loanableResource).
            should.eventually.be.fulfilled.
            then(function() {
                return corbelAdminDriver.borrow.resource(resourceId).applyFor(userId).
                should.be.eventually.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.property('error', 'conflict');
            }).
            should.notify(done);
        });

        it('and the license has expired, fails returning status CONFLICT (409)', function(done) {
            var userId = 'anyUser_' + Date.now();
            loanableResource.licenses[0].expire = Date.now() - 100000;

            corbelAdminDriver.borrow.resource().add(loanableResource).
            should.be.eventually.fulfilled.
            then(function() {
                return corbelAdminDriver.borrow.resource(resourceId).applyFor(userId).
                should.be.eventually.rejected;
            }).
            then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.property('error', 'conflict');
            }).
            should.notify(done);
        });


    });

    it('when the user applies for a non-existent loanable resource, fails returning status NOT FOUND (404)', function(done) {
        corbelAdminDriver.borrow.resource('anyResource').applyFor('anyUser_' + Date.now()).
        should.be.eventually.rejected.
        then(function(e) {
            expect(e).to.have.property('status', 404);
            expect(e).to.have.property('error', 'not_found');
        }).
        should.notify(done);
    });

});
