describe('In IAM module', function() {

    describe('when performing scopes CRUD operations', function() {
        var corbelDriver;
        var scopeId = 'TestScope' + Date.now();

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('a scope is created', function(done) {
            var expectedScope = corbelTest.common.iam.getScope(scopeId);

            corbelDriver.iam.scope()
            .create(expectedScope)
            .should.eventually.be.fulfilled
            .then(function(id) {
                expect(id).to.be.equals(expectedScope.id);

                return corbelDriver.iam.scope(expectedScope.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(scope) {
                expect(scope).to.have.deep.property('data.id', expectedScope.id);
                expect(scope).to.have.deep.property('data.audience', expectedScope.audience);
                expect(scope).to.have.deep.property('data.rules[0].testRule', expectedScope.rules[0].testRule);
                expect(scope).to.have.deep.property('data.parameters.a', expectedScope.parameters.a);
            })
            .should.notify(done);
        });

        it('a scope is removed', function(done) {
            var scope = corbelTest.common.iam.getScope(scopeId);

            corbelDriver.iam.scope()
            .create(scope)
            .should.eventually.be.fulfilled
            .then(function(id) {
                return corbelDriver.iam.scope(scope.id)
                .remove(id)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                var MAX_RETRY = 3;
                var RETRY_PERIOD = 1;
                return corbelTest.common.utils.retry(function() {
                    return corbelDriver.iam.scope(scope.id)
                    .get()
                    .should.eventually.be.rejected;
                }, MAX_RETRY, RETRY_PERIOD).
                should.be.eventually.fulfilled;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
