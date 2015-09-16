describe('In IAM module', function() {

    describe('when performing scopes CRUD operations', function() {
        var corbelRootDriver;
        var corbelDefaultDriver;
        var scopeId = 'ScopeTest' + Date.now();

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('an error 401 is returned when try to create a scope without authorization', function(done) {
            var expectedScope = corbelTest.common.iam.getScope(scopeId);

            corbelDefaultDriver.iam.scope()
            .create(expectedScope)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error 400 is returned when try to create a scope with \';\'', function(done) {
            var scope = corbelTest.common.iam.getScope(scopeId);
            scope.id = scope.id + ';';

            corbelRootDriver.iam.scope()
            .create(scope)
            .should.be.eventually.rejected.
            then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'scope_id_not_allowed');
            })
            .should.notify(done);
        });

        it('an error 422 is returned when try to create a scope with malformed entity', function(done) {
            var expectedScope = corbelTest.common.iam.getScope(scopeId);

            corbelRootDriver.iam.scope()
            .create('asdf')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to get a scope without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.scope(id)
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error 404 is returned when try to get a scope which does not exist', function(done) {
            var id = Date.now();

            corbelRootDriver.iam.scope(id)
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to delete a scope without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.scope(id)
            .remove()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });
    });
});
