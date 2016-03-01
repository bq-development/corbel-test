describe('In RESOURCES module', function() {

    describe('In RESMI module, when testing search over collections', function() {
        var corbelDriver;
        var COLLECTION = 'test:searchableCollection';
        var MAX_RETRY = 30;
        var RETRY_PERIOD = 1;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('a search retrieves expected results after a collection gets updated', function(done) {
                var createdResourceId;
                var random = Date.now();

                corbelDriver.resources.collection(COLLECTION)
                .add({
                    field1: 'Test' + random
                })
                .should.be.eventually.fulfilled
                .then(function(id) {
                    createdResourceId = id;
                    var params = {
                        search: 'Test' + random
                    };

                    return corbelTest.common.utils.retry(function() {
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
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data[0]).to.have.property('field1').to.be.equal('Test' + random);
                    expect(response.data[0]).to.have.property('id').to.be.equal(createdResourceId);

                    return corbelDriver.resources.resource(COLLECTION, createdResourceId)
                    .update({
                        field1: 'OtherTest' + random,
                    })
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var params = {
                        search: 'othertest' + random
                    };

                    return corbelTest.common.utils.retry(function() {
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
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data[0]).to.have.property('field1').to.be.equal('OtherTest' + random);
                    expect(response.data[0]).to.have.property('id').to.be.equal(createdResourceId);

                    return corbelDriver.resources.resource(COLLECTION, createdResourceId)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var params = {
                        search: 'othertest' + random
                    };

                    return corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                        .then(function(response) {
                            if (response.data.length !== 0) {
                                return Promise.reject();
                            } else {
                                return response;
                            }
                        });
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data.length).to.be.equal(0);
                })
                .should.notify(done);
            });
    });
});
