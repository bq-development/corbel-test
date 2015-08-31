describe.only('In IAM module, when testing domainAPIError', function() {
    var corbelRootDriver;

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'];
    });

    var getDomain = function(desc) {
        return {
            id: 'TestDomain_' + Date.now(),
            description: desc || 'anyDescription',
        };
    };

    describe('when performing domain CRUD operations', function() {

        it('should fail and return 422 when is requested to create an empty domain', function(done) {
            corbelRootDriver.iam.domain()
            .create({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should fail and return 409 when is requested to create an existent domain', function(done) {
            var expectedDomain = getDomain();

            corbelRootDriver.iam.domain()
            .create(expectedDomain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                expect(id).to.be.equal(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);

                return corbelRootDriver.iam.domain(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(domain) {
                var domainData = domain.data;
                domain.id = domainData.id.replace(/silkroad-qa:/g, '');

                expectedDomain.id = corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id;
                expect(domainData).to.include(expectedDomain);

                return corbelRootDriver.iam.domain()
                .create(domain)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'entity_exists');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should fail and return 422 when is requested to create a domain with : inside the id', function(done) {
            var expectedDomain = getDomain();
            expectedDomain.id = 'silkroad-qa:test';

            corbelRootDriver.iam.domain()
            .create(expectedDomain)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_domain_id');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should fail and return 404 when is requested to modify the id', function(done) {
            var expectedDomain = getDomain();
            var updateDomainId = 'anyDomain:test';
            var domainId;

            corbelRootDriver.iam.domain()
            .create(expectedDomain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                domainId = id;
                expect(domainId).to.be.equals(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);

                return corbelRootDriver.iam.domain(domainId)
                .update({domainId:updateDomainId})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.domain(updateDomainId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');

                return corbelRootDriver.iam.domain(domainId)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should fail and return 400 when is requested to get all domains using a query params are not valid',
        function(done) {
            var params = {
                query: [{
                    '$sum': {
                        description: 'domainDescription'
                    }
                }]
            };

            corbelRootDriver.iam.domain()
            .getAll(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'invalid_query');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });

    describe('for client management', function() {
        var timeStamp, domainId, scope1, scope2;
        var getScope = function(id) {
            return {
                id: id,
                audience: 'testAudience',
                rules: [{ testRule: 'this is a rule' }],
                parameters: { a: 1 }
            };
        };

        before(function(done) {
            timeStamp = Date.now();

            return corbelRootDriver.iam.scope()
            .create(getScope('TestScope1_' + timeStamp))
            .should.be.eventually.fulfilled
            .then(function(id) {
                scope1 = id;

                return corbelRootDriver.iam.scope()
                .create(getScope('TestScope2_' + timeStamp))
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                scope2 = id;

                return corbelRootDriver.iam.domain()
                .create({
                    id: 'TestDomain_' + timeStamp,
                    scopes: [scope1]
                })
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

        it('should fail with FORBIDDEN (403) when tries to create a client with more scopes than its domain',
        function(done) {
            return corbelRootDriver.iam.client(domainId)
            .create({
                name: 'TestClient_' + timeStamp,
                scopes: [scope1, scope2]
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 403);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
