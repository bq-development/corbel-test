describe('In RESOURCES module', function() {
    
    describe('In RESMI module, testing relation search, ', function() {
            var corbelDriver;
            var COLLECTION_A = 'test:searchableCollectionA';
            var COLLECTION_B = 'test:searchableCollectionB';
            var random;

            before(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
                random = Date.now();

                corbelDriver.resources.resource(COLLECTION_A, random + '1')
                .update({})
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                    .add(random + '1', {
                        field1: 'Test' + random,
                        notIndexedField: true,
                        description: 'And this is the first resource'
                    })
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                    .add(random + '2', {
                        field2: 'tEst' + random,
                        notIndexedField: 'hi!',
                        description: 'And this is the second resource'
                    })
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                    .add(random + '3', {
                        field3: 'teSt' + random,
                        notIndexedField: 12345,
                        description: 'And this is the third resource'
                    })
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            after(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                    .delete()
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

        describe.skip('when get relation with search', function() {

            it('successes returning elements satisfying the chain of search', function(done) {
                var params = {
                    search: 'test' + random
                };

                return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(3);
                    response.data.forEach(function(entry) {
                        delete entry.links;
                    });
                    expect(response.data).to.include({
                        'id': COLLECTION_B + '/' + random + '1',
                        field1: 'Test' + random,
                        description: 'And this is the first resource'
                    });
                    expect(response.data).to.include({
                        'id': COLLECTION_B + '/' + random + '2',
                        field2: 'tEst' + random,
                        description: 'And this is the second resource'
                    });
                    expect(response.data).to.include({
                        'id': COLLECTION_B + '/' + random + '3',
                        field3: 'teSt' + random,
                        description: 'And this is the third resource'
                    });

                    params.aggregation = {
                        '$count': '*'
                    };
                    return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                    .get(params)
                    .should.eventually.be.fulfilled;
                })
                .then(function(result) {
                    expect(result.data).to.have.property('count').to.be.equal(3);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('successes returning autocomplete elements' +
                   ' satisfying the incomplete chain of search [UNSTABLE]', function(done) {
                var incompleteChain = 'reso'; //incomplete chain "resource"
                var params = {
                    search: incompleteChain
                };

                return corbelDriver.resources.relation(COLLECTION_A, random + '1', COLLECTION_B)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    response.data.forEach(function(entry) {
                        expect(entry.description).to.contain(incompleteChain);
                    });
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
