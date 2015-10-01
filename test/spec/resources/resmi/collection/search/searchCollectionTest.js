describe('In RESOURCES module', function() {

    describe('in RESMI module', function() {
        var corbelDriver;
        var COLLECTION = 'test:searchableCollection';
        var MAX_RETRY = 30;
        var RETRY_PERIOD = 1;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        describe('testing search on collection', function() {
            var random, object1, object2, object3;

            beforeEach(function(done) {
                random = Date.now();
                object1 = {
                    id: random + ':1',
                    field1: 'Test' + random,
                    description: 'And this is the first resource',
                    sortField: 'pêche'
                };
                object2 = {
                    id: random + ':2',
                    field1: 'PartialUpdate',
                    field2: 'tEst' + random,
                    description: 'And this is the second resource',
                    sortField: 'péché'
                };
                object3 = {
                    id: random + ':3',
                    field3: 'teSt' + random,
                    description: 'And this is the third resource',
                    sortField: 'peach',
                    punctuationTest: 'La sombra. Celín. Tropiquillos. Theros.'
                };

                corbelDriver.resources.resource(COLLECTION, random + ':1')
                .update({
                    field1: 'Test' + random,
                    notIndexedField: true,
                    description: 'And this is the first resource',
                    sortField: 'pêche'
                })
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, random + ':2')
                    .update({
                        field1: 'Test' + random,
                        notIndexedField: true,
                        description: 'And this is the first resource',
                        sortField: 'péché'
                    });
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
                        description: 'And this is the third resource',
                        sortField: 'peach',
                        punctuationTest: 'La sombra. Celín. Tropiquillos. Theros.'
                    })
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements that satisfy a simple search', function(done) {
                var params = {
                    search: 'test' + random,
                    binded: true
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .then(function(response) {
                        if (response.data.length !== 3) {
                            return q.reject();
                        } else {
                            return response;
                        }
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.eventually.be.fulfilled
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
                .should.notify(done);
            });

            it('returns elements that satisfy a punctuation search', function(done) {
                var params = {
                    search: 'La sombra. Celín. Tropiquillos. Theros.',
                    binded: true
                };

                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .then(function(response) {
                        if (response.data.length !== 1) {
                            return q.reject();
                        } else {
                            return response;
                        }
                    });
                }, MAX_RETRY, RETRY_PERIOD)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    var data = response.data;
                    params.aggregation = {
                        '$count': '*'
                    };

                    expect(data.length).to.be.equal(1);
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
                .should.notify(done);
            });

            it('returns elements satisfying a simple search ordered by collators', function(done) {
                var params = {
                    search: 'test' + random,
                    sort: {
                        sortField: 'asc'
                    },
                    binded: true
                };
                var timeout = 5000;
                
                setTimeout(function(){
                    corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.be.eventually.fulfilled;
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 3);
                        expect(response).to.have.deep.property('data[0].sortField','peach');
                        expect(response).to.have.deep.property('data[1].sortField', 'péché');
                        expect(response).to.have.deep.property('data[2].sortField', 'pêche');
                    })
                    .should.notify(done);
                },timeout);
            });

            it('an error [400] is returned when try to sort by unexistent field', function(done) {
                var params = {
                    search: 'test' + random,
                    sort: {
                        unexistent: 'asc'
                    }
                };
                
                corbelTest.common.utils.retry(function() {
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.be.eventually.rejected;
                }, MAX_RETRY, RETRY_PERIOD)
                .should.be.eventually.fulfilled
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error','bad_request');
                })
                .should.notify(done);
            });

            it('returns elements that satisfy an incomplete chain of search', function(done) {
                //incomplete chain "resource"
                var incompleteChain = 'reso';
                var params = {
                    search: incompleteChain
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    var data = response.data;

                    data.forEach(function(entry) {
                        expect(entry.description).to.contain(incompleteChain);
                    });
                })
                .should.notify(done);
            });
        });
    });
});
