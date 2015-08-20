/* global describe, it, expect, timedTest, before, results, after, results */
        describe('In RESOURCES module', function() {

            describe('In RESMI module, testing relation sort, ', function() {
              var corbelDriver;
              var TIMESTAMP = Date.now();
              var COLLECTION_A = 'test:CorbelJSRelationSortA' + TIMESTAMP;
              var COLLECTION_B = 'test:CorbelJSRelationSortB' + TIMESTAMP;

              before(function() {
                  corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
              });

                describe('relation has sort and when', function() {
                    var amount = 5;
                    var idResourceInA;
                    var idsResourecesInB;

                    before(function(done) {
                        corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
                        .should.eventually.be.fulfilled
                        .then(function(id) {
                            idResourceInA = id[0];

                            return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount)
                            .should.eventually.be.fulfilled;
                        })
                        .then(function(ids) {
                            idsResourecesInB = ids;

                            return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                                (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                            .should.eventually.be.fulfilled;
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });

                    after(function(done) {
                        corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                        .should.eventually.be.fulfilled
                        .then(function() {
                            return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                            .delete()
                            .should.eventually.be.fulfilled;
                        })
                        .should.eventually.be.fulfilled.notify(done);
                    });

                    describe('get relation with ', function() {

                        describe('sorting by a numeric field ', function() {

                            it('should success returning the elements in order ascendant by intField', function(done) {
                                var params = {
                                    sort: {
                                        intField: 'asc'
                                    }
                                };

                                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                                .get(null ,params)
                                .should.eventually.be.fulfilled
                                .then(function(response) {
                                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'))
                                    .to.be.equal(true);
                                })
                                .should.eventually.be.fulfilled.notify(done);
                            });

                            it('should success returning the elements in order descendent by intField', function(done) {
                                var params = {
                                    sort: {
                                        intField: 'desc'
                                    }
                                };

                                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                                .get(null,params)
                                .should.eventually.be.fulfilled
                                .then(function(response) {
                                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'intField'))
                                    .to.be.equal(true);
                                }).
                                should.eventually.be.fulfilled.notify(done);
                            });
                        });

                        describe('incorrect sorting sort=bad ', function() {

                            it('should fail returning BAD REQUEST(400) using Corbeljs', function(done) {
                                var params = {
                                    sort: {
                                        stringField: 'BAD'
                                    }
                                };

                                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                                .get(null, params)
                                .should.eventually.be.rejected
                                .then(function(e) {
                                    expect(e).to.have.property('status', 400);
                                    expect(e.data).to.have.property('error', 'invalid_sort');
                                })
                                .should.eventually.be.fulfilled.notify(done);
                            });
                        });

                    });
                });
            });
    });
