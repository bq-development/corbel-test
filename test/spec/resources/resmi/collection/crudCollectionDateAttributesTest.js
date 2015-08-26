describe('In RESOURCES module', function() {

    describe('In RESMI module, testing Crud', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectCrud' + Date.now();
        var resourceId;
        var updatedAt;
        var TEST_OBJECT = {
                test: 'test',
                test2: 'test2',
                test3: 1,
                test4: 1.3,
                test5: {
                    t1: 1.3,
                    t2: [1, 2, 3.3]
                }
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        afterEach(function(done) {
            corbelDriver.resources.resource(COLLECTION, resourceId)
            .delete().
            should.be.eventually.fulfilled.
            then(function() {
                return corbelDriver.resources.resource(COLLECTION, resourceId)
                .delete().
                should.be.eventually.fulfilled;
            }).
            should.be.eventually.fulfilled.and.notify(done);
        });

        it('successful creation with date attributes', function(done) {
            corbelDriver.resources.collection(COLLECTION)
            .add(TEST_OBJECT)
            .should.be.eventually.fulfilled
            .then(function(id) {
                resourceId = id;
                return corbelDriver.resources.resource(COLLECTION, resourceId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data._updatedAt).to.be.equal(response.data._createdAt);
                updatedAt = response.data._updatedAt;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('successful update with date attributes', function(done) {
            var testObject = _.cloneDeep(TEST_OBJECT);

            testObject.newField = 'newField';
            testObject.test2 = null;

            return corbelDriver.resources.resource(COLLECTION, resourceId)
            .update(testObject)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION, resourceId)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                expect(response.data._updatedAt).to.be.greaterThan(updatedAt);
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when you create an object with PUT method ', function() {
            var idRandom;
            var TEST_OBJECT_CREATE_PUT = {
                test: 'test',
                test2: 'test2'
            };

            beforeEach(function() {
                 idRandom = 'id' + Date.now();
            });


            it('_updatedAt and _createdAt fields are equal', function(done) {

                corbelDriver.resources.resource(COLLECTION, idRandom)
                .update(TEST_OBJECT_CREATE_PUT)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, idRandom)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    updatedAt = response.data._updatedAt;
                    expect(response.data._updatedAt).to.be.equal(response.data._createdAt);
                    expect(response.data.test).to.be.equal('test');
                    expect(response.data.test2).to.be.equal('test2');
                }).
                should.be.eventually.fulfilled.and.notify(done);
            });

            it('if the resource is updated after its creation, _updatedAt is modified', function(done) {

                var TEST_OBJECT_CREATE_UPDATE = _.cloneDeep(TEST_OBJECT_CREATE_PUT);
                TEST_OBJECT_CREATE_UPDATE.newField = 'newField';
                TEST_OBJECT_CREATE_UPDATE.test = null;
                TEST_OBJECT_CREATE_UPDATE.test2 = 'test2Updated';

                corbelDriver.resources.resource(COLLECTION, idRandom)
                .update(TEST_OBJECT_CREATE_PUT)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, idRandom)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    updatedAt = response.data._updatedAt;
                    expect(response.data._updatedAt).to.be.equal(response.data._createdAt);
                    expect(response.data.test).to.be.equal('test');
                    expect(response.data.test2).to.be.equal('test2');

                    return corbelDriver.resources.resource(COLLECTION, idRandom)
                    .update(TEST_OBJECT_CREATE_UPDATE)
                    .should.be.eventually.fulfilled;
                }).then(function(response) {
                    return corbelDriver.resources.resource(COLLECTION, idRandom)
                    .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response.data._updatedAt).to.be.greaterThan(updatedAt);
                    expect(response.data.newField).to.be.equal('newField');
                    expect(response.data.test).to.be.equal(undefined);
                    expect(response.data.test2).to.be.equal('test2Updated');
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });
        });
    });
});
