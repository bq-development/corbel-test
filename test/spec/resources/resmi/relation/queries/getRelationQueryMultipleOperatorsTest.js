describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries, ', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;

        var amount = 5;
        var idResourceInA;
        var idsResourcesInB;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                idResourceInA = id[0];

                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                .should.be.eventually.fulfilled;
            })
            .then(function(ids) {
                idsResourcesInB = ids;

                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourcesInB)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
        
        describe('when combining query filters', function() {

            it('using gte and lte filters, elems between 200 and 400 are returned', function(done) {
                var params = {
                    query: [{
                        '$gte': {
                            intCount: 200
                        }
                    }, {
                        '$lte': {
                            intCount: 400
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    response.data.forEach(function(element) {
                        expect(element.intCount).to.within(200, 400);
                    });
                })
                .should.notify(done);
            });

            it('elems with stringSortCut eql to Test Short Cut and ObjectNumber in [3,5] are returned', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringSortCut: 'Test Short Cut'
                        }
                    }, {
                        '$in': {
                            ObjectNumber: [3, 5]
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);
                    response.data.forEach(function(element) {
                        expect(element).to.have.deep.property('stringSortCut', 'Test Short Cut');
                        expect(element.ObjectNumber).to.contain(3, 5);
                    });
                })
                .should.notify(done);
            });


            it('elements with intCount less than 300 are returned, in intField asc order', function(done) {
                var params = {
                    sort: {
                        intField: 'asc'
                    },
                    query: [{
                        '$lt': {
                            intCount: 300
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 3);
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'));
                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.below(300);
                    });
                }).
                should.notify(done);
            });

            it('query language that contains numeric field equal, pagination and sorting', function(done) {
                var params = {
                    sort: {
                        intField: 'asc'
                    },
                     pagination: {
                        page: 0,
                        pageSize: 2
                    },
                    query: [{
                        '$lt': {
                            intCount: 200
                        }
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'));
                    expect(response).to.have.deep.property('data.length', 2);
                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.below(200);
                    });
                })
                .should.notify(done);
            });
        });
    });
});