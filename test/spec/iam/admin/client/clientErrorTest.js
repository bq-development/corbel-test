describe('In IAM module', function() {
    var corbelRootDriver;
    var corbelDefaultDriver;

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('when performing client CRUD operations', function() {
        var timeStamp;
        var domainId;
        var scope1;
        var scope2;

        before(function(done) {
            timeStamp = Date.now();

            return corbelRootDriver.iam.scope()
            .create(corbelTest.common.iam.getScope('TestScope1_' + timeStamp))
            .should.be.eventually.fulfilled
            .then(function(id) {
                scope1 = id;

                return corbelRootDriver.iam.scope()
                .create(corbelTest.common.iam.getScope('TestScope2_' + timeStamp))
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                scope2 = id;

                return corbelRootDriver.iam.domain()
                .create(corbelTest.common.iam.getDomain())
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                domainId = id;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        after(function(done) {
            return corbelRootDriver.iam.domain(domainId)
            .remove()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.scope(scope1)
                .remove(scope1)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.scope(scope2)
                .remove(scope2)
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error 409 is returned when try to create an existing client', function(done) {
            var client = corbelTest.common.iam.getClient(Date.now(), domainId);
            var clientId;

            corbelRootDriver.iam.client(client.domain)
            .create(client)
            .should.be.eventually.fulfilled
            .then(function(id) {
                clientId = id;

                return corbelRootDriver.iam.client(client.domain)
                .create(client)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'conflict');

                return corbelRootDriver.iam.client(client.domain, clientId)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error 403 is returned when try to create a client with more scopes than his domain', function(done) {
            corbelRootDriver.iam.client(domainId)
            .create({
                name: 'TestClient_' + timeStamp,
                scopes: [scope1, scope2]
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
                expect(e).to.have.deep.property('data.error', 'scopes_not_allowed');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to create a client without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.client(domainId, id)
            .create({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 422 is returned when try to create a client with malformed data', function(done) {
            var id = Date.now();

            corbelRootDriver.iam.client(domainId, id)
            .create({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error 404 is returned when try to get a client which does not exist', function(done) {
            var id = Date.now();

            corbelRootDriver.iam.client(domainId, null)
            .get(id)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to get a client without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.client(domainId, null)
            .get(id)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to update a client without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.client(domainId, id)
            .update({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });

        it('an error 401 is returned when try to remove a client without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.client(domainId, id)
            .remove()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized_token');
            })
            .should.notify(done);
        });
    });
});
