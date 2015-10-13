describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing relations with distinct', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:distinctRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:distinctRelationB' + TIMESTAMP;
        var amount = 10;

        var idResourceInA;
        var idsResourecesInB;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
                .should.eventually.be.fulfilled
                .then(function(id) {
                    idResourceInA = id[0];
                    return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                        .should.eventually.be.fulfilled;
                })
                .then(function(ids) {
                    idsResourecesInB = ids;
                    return corbelTest.common.resources
                        .createRelationFromSingleObjetToMultipleObject(corbelDriver,COLLECTION_A,
                            idResourceInA, COLLECTION_B, idsResourecesInB)
                        .should.eventually.be.fulfilled;
                })
                .should.be.eventually.fulfilled.and.notify(done);

        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B).delete()
                        .should.eventually.be.fulfilled;
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });




        it('retrieve the distinct values in a relation for a field', function(done) {
            var params = {
                distinct: 'distinctField'
            };
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null,params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(2);
                    response.data.forEach(function(element) {
                        expect([0, 1]).to.include(element.distinctField);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('retrieve the distinct values in a collection for a field', function(done) {
            var params = {
                distinct: 'distinctField2'
            };
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null,params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(4);
                    response.data.forEach(function(element) {
                        expect([0, 1, 2, 3]).to.include(element.distinctField2);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('retrieve elements filter a field using distinct with sort asc order by other field', function(done) {
            var params = {
                sort: {
                    stringField: 'asc'
                },
                distinct: 'distinctField2'
            };
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null,params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(4);
                    expect(corbelTest.common
                        .resources
                        .checkSortingAsc(response.data, 'stringField')).to.be.equal(true);
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('retrieve elements filter a field using distinct with sort asc', function(done) {
            var params = {
                distinct: 'distinctField2',
                sort: {
                    distinctField2: 'asc'
                },
            };
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null,params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(4);
                    expect(corbelTest.common
                        .resources
                        .checkSortingAsc(response.data, 'distinctField2')).to.be.equal(true);
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('retrieve elements filter a field using distinct with sort desc order by other field', function(done) {
            var params = {
                sort: {
                    distinctField2: 'desc'
                },
                distinct: 'distinctField2'
            };
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null,params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(4);
                    expect(corbelTest.common
                        .resources
                        .checkSortingDesc(response.data, 'distinctField2')).to.be.equal(true);
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('retrieve collection using a field distinct value and' +
            'the query language greater than equals', function(done) {
            var params = {
                distinct: 'distinctField2',
                query: [{
                    '$gt': {
                        intCount: 700
                    }
                }]
            };
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null,params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(2);
                    response.data.forEach(function(element) {
                        expect(element.intCount).to.be.above(700);
                        expect([0, 1]).to.include(element.distinctField2);
                    });
                })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
