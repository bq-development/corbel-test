describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing collection distinct', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectistinct' + Date.now();
        var amount = 10;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
        });



        it('retrieve the distinct elements in a collection', function(done) {
            var params = {
                distinct: 'distinctField'
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
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
            corbelDriver.resources.collection(COLLECTION)
                .get(params)
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
            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(4);
                    expect(corbelTest.common.resources
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
            corbelDriver.resources.collection(COLLECTION)
                .get(params)
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
            corbelDriver.resources.collection(COLLECTION)
                .get(params)
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
            'the query language greater and less than equals',
            function(done) {
                var params = {
                    distinct: 'distinctField2',
                    query: [{
                        '$gte': {
                            intField: 300
                        }
                    }, {
                        '$lte': {
                            intField: 500
                        }
                    }]
                };
                corbelDriver.resources.collection(COLLECTION)
                    .get(params)
                    .should.eventually.be.fulfilled
                    .then(function(response) {
                        expect(response.data.length).to.be.equal(3);
                        response.data.forEach(function(element) {
                            expect(element.intField).to.within(300, 500);
                            expect([0, 1, 2, 3]).to.include(element.distinctField2);
                        });
                    })
                    .should.be.eventually.fulfilled.and.notify(done);
            });

        it('retrieve the distinct elements in a collection using some fields', function(done) {
            var params = {
                distinct: ['distinctField', 'distinctField2']
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(4);
                    response.data.forEach(function(element) {
                        expect([0, 1]).to.include(element.distinctField);
                        expect([0, 1, 2, 3]).to.include(element.distinctField2);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });

        it('retrieve the distinct elements in a collection using 2 fields', function(done) {
            var params = {
                distinct: ['distinctField2', 'distinctField3']
            };

            corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response.data.length).to.be.equal(10);
                    response.data.forEach(function(element) {
                        expect([0, 1, 2, 3, 4]).to.include(element.distinctField3);
                        expect([0, 1, 2, 3]).to.include(element.distinctField2);
                    });
                })
                .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
