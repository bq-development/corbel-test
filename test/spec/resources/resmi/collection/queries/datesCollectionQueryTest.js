describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing collection queries', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectQuery' + Date.now();
        var amount = 10;
        var count;
        var timeMargin = 10000;
        var maxCreateAt;

        var serverDateToLocal = function(stringDate, offset) {
            offset = offset || 0;
            var date = new Date(stringDate).getTime();
            var utcOffset = new Date().getTimezoneOffset() * 60000;
            return date - utcOffset + offset;
        };

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
                .should.be.eventually.fulfilled
                .then(function() {
                    var params = {
                        aggregation: {
                            '$max': '_createdAt'
                        }
                    };
                    return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    maxCreateAt = serverDateToLocal(response.data.max, 1000);
                })
                .should.notify(done);
        });

        after(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when getting a collection using "greater than" query language', function() {
            it('the used timestamp parameter is applied in the query to _updateAt field', function(done) {
                var date;
                var updateParams = {
                    randomField: 'qwer'
                };
                var queryParams;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                    .get()
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        date = response.data[0]._updatedAt;
                        queryParams = {
                            query: [{
                                '$gt': {
                                    _updatedAt: date
                                }
                            }]
                        };
                        firstElementId = response.data[0].id;

                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        count = response.data.length;
                        return corbelDriver.resources.resource(COLLECTION, firstElementId)
                            .update(updateParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', count + 1);
                    })
                    .should.notify(done);
            });

            it('the used ISODate parameter is applied in the query to _updateAt field', function(done) {
                var date;
                var updateParams = {
                    randomField: 'qwer'
                };
                var queryParams;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                    .get()
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        date = 'ISODate(' + new Date(response.data[0]._updatedAt).toISOString() + ')';
                        queryParams = {
                            query: [{
                                '$gt': {
                                    _updatedAt: date
                                }
                            }]
                        };
                        firstElementId = response.data[0].id;

                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        count = response.data.length;
                        return corbelDriver.resources.resource(COLLECTION, firstElementId)
                            .update(updateParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', count + 1);
                    })
                    .should.notify(done);
            });

            it('the used ISODate parameter is applied in the query to _createAt field', function(done) {
                var queryParams = {
                    query: [{
                        '$gt': {
                            _createdAt: 'ISODate(' + new Date(maxCreateAt).toISOString() + ')'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 0);
                    })
                    .should.notify(done);
            });

            it('the used timestamp parameter is applied in the query to _createAt field', function(done) {
                var queryParams = {
                    query: [{
                        '$gt': {
                            _createdAt: maxCreateAt
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 0);
                    })
                    .should.notify(done);
            });
        });

        describe('when getting a collection using "lower than" query language', function() {
            it('a timestamp parameter is used in the query and applied to _updateAt field', function(done) {
                var date;
                var updateParams = {
                    randomField: 'qwer'
                };
                var queryParams;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                    .get()
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        date = response.data[0]._updatedAt;
                        queryParams = {
                            query: [{
                                '$lt': {
                                    _updatedAt: date
                                }
                            }]
                        };
                        firstElementId = response.data[0].id;

                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        count = response.data.length;
                        return corbelDriver.resources.resource(COLLECTION, firstElementId)
                            .update(updateParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', count);
                    })
                    .should.notify(done);
            });

            it('the used ISODate parameter is applied in the query to _updateAt field', function(done) {
                var date;
                var updateParams = {
                    randomField: 'qwer'
                };
                var queryParams;
                var count;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                    .get()
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        date = 'ISODate(' + new Date(response.data[0]._updatedAt).toISOString() + ')';
                        queryParams = {
                            query: [{
                                '$lt': {
                                    _updatedAt: date
                                }
                            }]
                        };
                        firstElementId = response.data[0].id;

                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        count = response.data.length;
                        return corbelDriver.resources.resource(COLLECTION, firstElementId)
                            .update(updateParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                            .get(queryParams)
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', count);
                    })
                    .should.notify(done);
            });

            it('the used ISODate parameter is applied in the query to _createAt field', function(done) {
                var queryParams = {
                    query: [{
                        '$lt': {
                            _createdAt: 'ISODate(' + new Date(maxCreateAt).toISOString() + ')'
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', amount);
                    })
                    .should.notify(done);
            });

            it('the used timestamp parameter is applied in the query to _createAt field', function(done) {
                var queryParams = {
                    query: [{
                        '$lt': {
                            _createdAt: maxCreateAt
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', amount);
                    })
                    .should.notify(done);
            });
        });
    });
});
