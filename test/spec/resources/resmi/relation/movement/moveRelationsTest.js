describe('In RESOURCES module', function() {

    describe('In RESMI module, testing moveRelation, ', function() {
        this.timeout(50000);
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSOrderRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSOrderRelationB' + TIMESTAMP;
        var params = {
            sort: {
                '_order': 'asc'
            }
        };
        var amount = 3;
        var idResourceInA;
        var idsResourecesInB;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        beforeEach(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
            .should.eventually.be.fulfilled
            .then(function(id) {
                idResourceInA = id[0];
                return corbelTest.common.resources.createdObjectsToQuery(corbelDriver,COLLECTION_B, amount)
                .should.eventually.be.fulfilled;
            })
            .then(function(ids) {
                idsResourecesInB = ids;

                return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                    (corbelDriver,COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB)
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .delete()
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        describe('relation has sorting in the insertion', function() {

            it('should move relation in differents positions and success returning elements', function(done) {

                var idResource3;
                var idResourceMiddle;
                var idResourceLast;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                    .to.be.equal(true);
                    idResource3 = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResource3, 1)
                    .should.eventually.be.fulfilled;
                }).then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.fulfilled;
                }).then(function(response) {
                    expect(response.data[0].id).to.be.equal(idResource3);
                    idResourceMiddle = response.data[2].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResourceMiddle, amount)
                    .should.eventually.be.fulfilled;
                }).then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.fulfilled;
                }).then(function(response) {
                    expect(response.data[amount - 1].id).to.be.equal(idResourceMiddle);
                    idResourceLast = response.data[amount - 1].id;

                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .move(idResourceLast, 3)
                    .should.eventually.be.fulfilled;
                }).then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .should.eventually.be.fulfilled;
                }).then(function(response) {
                    expect(response.data[2].id).to.be.equal(idResourceLast);
                })
                .should.eventually.be.fulfilled.notify(done);
            });

          it('should move relation without number position and fail returning error 400 BAD REQUEST',
          function(done) {

              var idResource;

              corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
              .get(null, params)
              .should.eventually.be.fulfilled
              .then(function(response) {
                  expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                  .to.be.equal(true);
                  idResource = response.data[2].id;

                  return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                  .move(idResource)
                  .should.eventually.be.rejected;
              })
              .then(function(e) {
                  expect(e).to.have.property('status', 400);
              })
              .should.eventually.be.fulfilled.notify(done);
          });

          it('should move relation to 0 position and fail returning error 400 BAD REQUEST', function(done) {

              var idResource;

              corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
              .get(null, params)
              .should.eventually.be.fulfilled
              .then(function(response) {
                  expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                  .to.be.equal(true);
                  idResource = response.data[2].id;

                  return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                  .move(idResource, 0)
                  .should.eventually.be.rejected;
              })
              .then(function(e) {
                  expect(e).to.have.property('status', 400);
              })
              .should.eventually.be.fulfilled.notify(done);
          });
    });

    describe('Move relation the last position to specific postion over 30 times ', function() {

        it('should success returning elements', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
            .get(null, params)
            .should.eventually.be.fulfilled
            .then(function(response) {
              expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
              .to.be.equal(true);

              return corbelTest.common.resources.fastMove(corbelDriver,
                response.data[amount - 1].id, response.data[amount - 2].id,
                200, COLLECTION_A, idResourceInA, COLLECTION_B)
                .should.eventually.fulfilled;
              })
              .then(function(idResource) {
                return corbelTest.common.resources.repeatMove(corbelDriver, idResource, 10,
                  COLLECTION_A, idResourceInA, COLLECTION_B, params, amount)
                  .should.eventually.fulfilled;
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
