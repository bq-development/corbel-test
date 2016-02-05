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
            var random, object1, object2, object3, object4;
            var punctText = 'La sombra. Celín. Tropiquillos. Theros.';


            beforeEach(function(done) {
                random = Date.now();
                object1 = {
                    field1: 'Test' + random,
                    notIndexedField: true,
                    description: 'And this is the first resource',
                    sortField: 'pêche',
                    random: random
                };

                object2 = {
                    field1: 'Test' + random,
                    notIndexedField: true,
                    description: 'And this is the first resource',
                    sortField: 'péché',
                    random: random
                };

                object3 = {
                    field3: 'teSt' + random,
                    field2: 'test' + random,
                    notIndexedField: 12345,
                    description: 'And this is the third resource',
                    sortField: 'peach',
                    punctuationTest: punctText,
                    random: random
                };

                object4 = {
                    field1: 'other value',
                    notIndexedField: true,
                    description: 'this resource not found',
                    sortField: 'pocho',
                    random: random
                };

                var updatedObject2 = {
                    field2: 'tEst' + random,
                    notIndexedField: 'hi!',
                    description: 'And this is the second resource',
                    random: random
                };

                corbelDriver.resources.resource(COLLECTION, random + ':1')
                    .update(object1)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        object1.id = random + ':1';
                        return corbelDriver.resources.resource(COLLECTION, random + ':2')
                            .update(object2);
                    })
                    .should.be.eventually.fulfilled
                    .then(function() {
                        object2.id = random + ':2';
                        return corbelDriver.resources.resource(COLLECTION, random + ':2')
                            .update(updatedObject2)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        for (var attrname in updatedObject2) {
                            if (updatedObject2.hasOwnProperty(attrname)) {
                                object2[attrname] = updatedObject2[attrname];
                            }
                        }
                        return corbelDriver.resources.resource(COLLECTION, random + ':2')
                            .update({
                                field1: 'PartialUpdate'
                            })
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        object2.field1 = 'PartialUpdate';
                        return corbelDriver.resources.resource(COLLECTION, random + ':3')
                            .update(object3)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {

                        object3.id = random + ':3';
                        return corbelDriver.resources.resource(COLLECTION, random + ':4')
                            .update(object4)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {

                        object4.id = random + ':4';
                    })
                    .should.notify(done);
            });

            afterEach(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            it('returns elements that satisfy a simple search', function(done) {
                var params = {
                    search: 'test' + random
                };

                corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                            .get(params)
                            .then(function(response) {
                                if (response.data.length !== 3) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        params.aggregation = {
                            '$count': '*'
                        };
                        response.data.forEach(function(entry) {
                            delete entry.links;
                            delete entry._createdAt;
                            delete entry._updatedAt;
                        });

                        expect(response).to.have.deep.property('data.length', 3);
                        //the first is the third resource cause has the exact term in 'field2'
                        expect(response.data[0]).to.have.deep.property('id', random + ':3');
                        expect(response).to.have.property('data').and.to.include(object1);
                        expect(response).to.have.property('data').and.to.include(object2);
                        expect(response).to.have.property('data').and.to.include(object3);

                        return corbelDriver.resources.collection(COLLECTION)
                            .get(params)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(result) {
                        expect(result).to.have.deep.property('data.count', 3);
                    })
                    .should.notify(done);
            });

            it('successes returning elements satisfying the chain of search with two words, ' +
                'respecting the elasticsearch order',
                function(done) {
                    var params = {
                        search: 'second this',
                        query: [{
                            random: random
                        }]
                    };

                    corbelTest.common.utils.retry(function() {
                            return corbelDriver.resources.collection(COLLECTION)
                                .get(params)
                                .then(function(response) {
                                    if (response.data.length !== 4) {
                                        return Promise.reject();
                                    } else {
                                        return response;
                                    }
                                });
                        }, MAX_RETRY, RETRY_PERIOD)
                        .should.be.eventually.fulfilled
                        .then(function(response) {
                            params.aggregation = {
                                '$count': '*'
                            };
                            response.data.forEach(function(entry) {
                                delete entry.links;
                                delete entry._createdAt;
                                delete entry._updatedAt;
                            });
                            expect(response).to.have.deep.property('data.length', 4);
                            //the first is the second resource cause has the two words
                            expect(response.data[0]).to.have.deep.property('id', random + ':2');
                            expect(response).to.have.property('data').and.to.include(object1);
                            expect(response).to.have.property('data').and.to.include(object2);
                            expect(response).to.have.property('data').and.to.include(object3);
                            expect(response).to.have.property('data').and.to.include(object4);

                            return corbelDriver.resources.collection(COLLECTION)
                                .get(params)
                                .should.be.eventually.fulfilled;
                        })
                        .then(function(result) {
                            expect(result).to.have.deep.property('data.count', 4);
                        })
                        .should.notify(done);
                });

            it('returns elements that satisfy a punctuation search', function(done) {
                var params = {
                    search: punctText,
                    query: [{
                        random: random
                    }]
                };

                corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                            .get(params)
                            .then(function(response) {
                                if (response.data.length !== 1) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        var data = response.data;
                        data.forEach(function(entry) {
                            delete entry.links;
                        });

                        expect(data.length).to.be.equal(1);
                        expect(data[0]).to.have.property('punctuationTest', punctText);
                    })
                    .should.notify(done);
            });

            it('returns elements satisfying a simple search ordered by collators', function(done) {
                var params = {
                    search: 'test' + random,
                    sort: {
                        sortField: 'asc'
                    }
                };
                var timeout = 5000;

                setTimeout(function() {
                    corbelTest.common.utils.retry(function() {
                            return corbelDriver.resources.collection(COLLECTION)
                                .get(params)
                                .should.be.eventually.fulfilled;
                        }, MAX_RETRY, RETRY_PERIOD)
                        .should.be.eventually.fulfilled
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.length', 3);
                            expect(response).to.have.deep.property('data[0].sortField', 'peach');
                            expect(response).to.have.deep.property('data[1].sortField', 'péché');
                            expect(response).to.have.deep.property('data[2].sortField', 'pêche');
                        })
                        .should.notify(done);
                }, timeout);
            });

            it('returns elements paginated, respecting the elasticsearch order', function(done) {
                var params = {
                    search: 'test' + random,
                    pagination: {
                        pageSize: 2
                    }
                };
                var timeout = 5000;

                setTimeout(function() {
                    corbelTest.common.utils.retry(function() {
                            return corbelDriver.resources.collection(COLLECTION)
                                .get(params)
                                .should.be.eventually.fulfilled;
                        }, MAX_RETRY, RETRY_PERIOD)
                        .should.be.eventually.fulfilled
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.length', 2);
                            expect(response).to.have.deep.property('data[0].id', random + ':3');
                            params.pagination.page = 1;
                            return corbelDriver.resources.collection(COLLECTION)
                                .get(params)
                                .should.be.eventually.fulfilled;
                        })
                        .then(function(response) {
                            expect(response).to.have.deep.property('data.length', 1);
                        })
                        .should.notify(done);
                }, timeout);
            });

            it('an error [400] is returned when try to sort by unexistent field [UNSTABLE]', function(done) {
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
                        expect(e).to.have.deep.property('data.error', 'bad_request');
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

            it('returns elements with only index params', function(done) {
                var params = {
                    search: 'test' + random,
                    indexFieldsOnly: true
                };

                corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                            .get(params)
                            .then(function(response) {
                                if (response.data.length !== 3) {
                                    return Promise.reject();
                                } else {
                                    return response;
                                }
                            });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        params.aggregation = {
                            '$count': '*'
                        };
                        response.data.forEach(function(entry) {
                            delete entry.links;
                        });

                        expect(response).to.have.deep.property('data.length', 3);

                        var data = response.data;

                        data.forEach(function(entry) {
                            expect(entry).to.not.have.property('notIndexedField');
                        });

                        return corbelDriver.resources.collection(COLLECTION)
                            .get(params)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(result) {
                        expect(result).to.have.deep.property('data.count', 3);
                    })
                    .should.notify(done);
            });
        });
    });
});