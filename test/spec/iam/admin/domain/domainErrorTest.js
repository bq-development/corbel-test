describe('In IAM module', function() {
    var corbelDriver;
    var corbelDefaultDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        corbelDefaultDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('when performing domain CRUD operations', function() {

        it('an error 422 is returned when try to create an empty domain', function(done) {
            corbelDriver.iam.domain()
            .create({})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error 409 is returned while trying to create an existent domain', function(done) {
            var expectedDomain = corbelTest.common.iam.getDomain();

            corbelDriver.iam.domain()
            .create(expectedDomain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                expect(id).to.be.equal(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);

                return corbelDriver.iam.domain(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(domain) {
                expect(domain).to.have.deep.property('data.id', corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);

                return corbelDriver.iam.domain()
                .create(expectedDomain)
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'entity_exists');
            })
            .should.notify(done);
        });

        it('an error 422 is returned while trying to create a domain with : inside the id', function(done) {
            var expectedDomain = corbelTest.common.iam.getDomain();
            expectedDomain.id = 'silkroad-qa:test';

            corbelDriver.iam.domain()
            .create(expectedDomain)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_domain_id');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to create a domain without authorization', function(done) {
            var expectedDomain = corbelTest.common.iam.getDomain();
            expectedDomain.id = 'silkroad-qa:test';

            corbelDefaultDriver.iam.domain()
            .create(expectedDomain)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error 404 is returned while trying to modify the domain id', function(done) {
            var expectedDomain = corbelTest.common.iam.getDomain();
            var updateDomainId = 'anyDomain:test';
            var domainId;

            corbelDriver.iam.domain()
            .create(expectedDomain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                domainId = id;
                expect(domainId).to.be.equals(corbelTest.CONFIG.DOMAIN  + ':' + expectedDomain.id);

                return corbelDriver.iam.domain(domainId)
                .update({domainId:updateDomainId})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.domain(updateDomainId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');

                return corbelDriver.iam.domain(domainId)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error 401 is returned while trying to get a domain which does not exist', function(done) {
            var id = Date.now();

            corbelDriver.iam.domain(id)
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to create a domain without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.domain(id)
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error 400 is returned while trying to get all domains using invalid query params',
        function(done) {
            var params = {
                query: [{
                    '$sum': {
                        description: 'domainDescription'
                    }
                }]
            };

            corbelDriver.iam.domain()
            .getAll(params)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'invalid_query');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to update a domain without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.domain(id)
            .update(corbelTest.common.iam.getDomain())
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
        });

        it('an error 422 is returned while trying to update a domain with malformed entity', function(done) {
            var id = Date.now();

            corbelDriver.iam.domain('Pepe')
            .update('asdf')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 422);
                expect(e).to.have.deep.property('data.error', 'invalid_entity');
            })
            .should.notify(done);
        });

        it('an error 401 is returned while trying to delete a domain without authorization', function(done) {
            var id = Date.now();

            corbelDefaultDriver.iam.domain(id)
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
