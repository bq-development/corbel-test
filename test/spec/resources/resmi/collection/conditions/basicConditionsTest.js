describe('In RESOURCES module', function() {
    var corbelDriver;

    describe('In RESMI module', function() {

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });
        var COLLECTION_NAME_CRUD = 'test:ConditionalPUT' + Date.now();

        describe('when does conditional update', function() {

            it('the condition must be satisfied to update', function(done) {
                var resourceId;
                var TEST_OBJECT = {
                    test: 1
                };

                corbelDriver.resources.collection(COLLECTION_NAME_CRUD).add(TEST_OBJECT)
                .should.eventually.be.fulfilled
                .then(function(id) {
                    resourceId = id;
                    var params = {
                        condition: [{
                            '$eq': {
                                test: 2
                            }
                        }]
                    };
                    TEST_OBJECT.test = 2;
                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                    .update(TEST_OBJECT, params)
                    .should.eventually.be.rejected;
                })
                .then(function(e) {
                    //TODO send an object instead of string to avoid parse
                    var error = JSON.parse(e.data.responseText);

                    expect(e).to.have.property('status', 412);
                    expect(error).to.have.property('error', 'precondition_failed');
                    var params = {
                        conditions: [{
                            condition: [{
                                '$eq': {
                                    test: 2
                                }
                            }]
                        }, {
                            condition: [{
                                '$eq': {
                                    test: 3
                                }
                            }]
                        }]
                    };
                    TEST_OBJECT.test = 3;
                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                    .update(TEST_OBJECT,params)
                    .should.eventually.be.rejected;
                })
                .then(function(e) {
                    //TODO send an object instead of string to avoid parse
                    var error = JSON.parse(e.data.responseText);

                    expect(e).to.have.property('status', 412);
                    expect(error).to.have.property('error', 'precondition_failed');
                    var params = {
                        condition: [{
                            '$eq': {
                                test: 1
                            }
                        }]
                    };
                    TEST_OBJECT.test = 2;

                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                    .update(TEST_OBJECT, params)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    var params = {
                        conditions: [{
                            condition: [{
                                '$eq': {
                                    test: 1
                                }
                            }]
                        }, {
                            condition: [{
                                '$eq': {
                                    test: 2
                                }
                            }]
                        }]
                    };
                    TEST_OBJECT.test = 3;

                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                    .update(TEST_OBJECT, params)
                    .should.eventually.be.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(resultObject) {
                    expect(resultObject.data.test).to.be.equal(3);
                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).delete()
                    .should.eventually.be.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('and object id do not exists, the object has not been created', function(done) {
                var resourceId = Date.now();

                var TEST_OBJECT = {
                    test: 1
                };

                var params = {
                    condition: [{
                        '$eq': {
                            test: 2
                        }
                    }]
                };
                corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId)
                .update(TEST_OBJECT, params)
                .should.eventually.be.rejected
                .then(function(e) {
                    //TODO send an object instead of string to avoid parse
                    var error = JSON.parse(e.data.responseText);

                    expect(e).to.have.property('status', 412);
                    expect(error).to.have.property('error', 'precondition_failed');
                    return corbelDriver.resources.resource(COLLECTION_NAME_CRUD, resourceId).get()
                    .should.eventually.be.rejected;
                })
                .then(function(e) {
                    //TODO send an object instead of string to avoid parse
                    var error = JSON.parse(e.data.responseText);

                    expect(e).to.have.property('status', 404);
                    expect(error).to.have.property('error', 'not_found');
                }).
                should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
