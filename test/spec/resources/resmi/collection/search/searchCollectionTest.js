describe('In RESOURCES module', function() {

    describe.skip('In RESMI module, testing search', function() {
        var corbelDriver;
        var COLLECTION = 'test:searchableCollection';

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        // This tests will work correctly when elastic search works fine
        describe('when get searchable collection', function() {
            var random, object1, object2, object3;

            beforeEach(function(done) {
                random = Date.now();
                object1 = {
                    id: random + ':1',
                    field1: 'Test' + random,
                    description: 'And this is the first resource',
                    searchableField: 'search',
                    sortField: 'pêche'
                };
                object2 = {
                    id: random + ':2',
                    field1: 'PartialUpdate',
                    field2: 'tEst' + random,
                    description: 'And this is the second resource',
                    searchableField: 'search',
                    sortField: 'péché'
                };
                object3 = {
                    id: random + ':3',
                    field3: 'teSt' + random,
                    description: 'And this is the third resource',
                    searchableField: 'search',
                    sortField: 'peach'
                };

                corbelDriver.resources.resource(COLLECTION, random + ':1')
                .update({
                    field1: 'Test' + random,
                    notIndexedField: true,
                    description: 'And this is the first resource',
                })
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, random + ':2')
                    .update({
                        field2: 'tEst' + random,
                        notIndexedField: 'hi!',
                        description: 'And this is the second resource'
                    })
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, random + ':2')
                    .update({
                        field1: 'PartialUpdate'
                    })
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, random + ':3')
                    .update({
                        field3: 'teSt' + random,
                        notIndexedField: 12345,
                        description: 'And this is the third resource'
                    })
                    .should.be.eventually.fulfilled;
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying a simple search', function(done) {
                var params = {
                    search: 'test' + random
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    var data = response.data;
                    params.aggregation = {
                        '$count': '*'
                    };

                    expect(data.length).to.be.equal(3);
                    data.forEach(function(entry) {
                        delete entry.links;
                    });
                    expect(data).to.include(object1);
                    expect(data).to.include(object2);
                    expect(data).to.include(object3);


                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(result) {
                    expect(result).to.have.deep.property('data.count', 3);

                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements satisfying a simple search ordered by collators', function(done) {
                var params = {
                    search: {
                        searchableField: 'search'
                    },
                    sort: {
                        sortField: 'asc'
                    }
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {

                    expect(response).to.have.deep.property('data.length', 3);
                    expect(response).to.have.deep.property('data[0].sortField','peach');
                    expect(response).to.have.deep.property('data[1].sortField', 'péché');
                    expect(response).to.have.deep.property('data[2].sortField', 'pêche');
                })
                .should.notify(done);
            });

            it('returns elements satisfying a search in certain fields', function(done) {
                var params = {
                    search: {
                        text: 'test' + random,
                        fields: ['field1', 'field3']
                    }
                };

                return corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var data = response.data;
                    params.aggregation = {
                        '$count': '*'
                    };

                    expect(data.length).to.be.equal(2);
                    data.forEach(function(entry) {
                        delete entry.links;
                    });
                    expect(data).to.include(object1);
                    expect(data).to.include(object3);

                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(result) {
                    expect(result).to.have.deep.property('data.count', 2);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns autocomplete elements' +
                   ' satisfying the incomplete chain of search', function(done) {
                //incomplete chain "resource"
                var incompleteChain = 'reso';
                var params = {
                    search:  incompleteChain
                };

                return corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var data = response.data;

                    data.forEach(function(entry) {
                        expect(entry.description).to.contain(incompleteChain);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });
    });
});
