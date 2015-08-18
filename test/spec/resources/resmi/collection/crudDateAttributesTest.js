describe('In RESOURCES module', function() {

    describe('In RESMI module, testing Crud ', function() {
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
        });

        afterEach(function(done) {
            corbelDriver.resources.resource(COLLECTION, resourceId)
            .delete().
            should.eventually.be.fulfilled.
            then(function() {
                return corbelDriver.resources.resource(COLLECTION, resourceId)
                .delete().
                should.eventually.be.fulfilled;
            }).
            should.eventually.be.fulfilled.notify(done);
        });

        var COLLECTION = 'test:CorbelJSObjectCrud' + Date.now();

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

        var resourceId;
        var updatedAt;

        describe('when you create a collection is added _createdAt & _updatedAt attributes', function() {

            it('and successful creation ', function(done) {
                corbelDriver.resources.collection(COLLECTION)
                .add(TEST_OBJECT)
                .should.eventually.be.fulfilled
                .then(function(id) {
                    resourceId = id;
                    return corbelDriver.resources.resource(COLLECTION, resourceId)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data._updatedAt).to.be.equal(response.data._createdAt);
                    updatedAt = response.data._updatedAt;
                })
                .should.eventually.be.fulfilled.notify(done);
            });

            it('and successful update', function(done) {
                var testObject = _.cloneDeep(TEST_OBJECT);

                testObject.newField = 'newField';
                testObject.test2 = null;

                return corbelDriver.resources.resource(COLLECTION, resourceId)
                .update(testObject)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resourceId)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data._updatedAt).to.be.greaterThan(updatedAt);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });

        describe('when you create object with put method then _updatedAt equals _createdAt', function() {
            var idRandom = 'id' + Date.now();

            var TEST_OBJECT_CREATE_PUT = {
                test: 'test',
                test2: 'test2'
            };

            it('and successes', function(done) {

                corbelDriver.resources.resource(COLLECTION, idRandom)
                .update(TEST_OBJECT_CREATE_PUT)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, idRandom)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data._updatedAt).to.be.equal(response.data._createdAt);
                    expect(response.data.test).to.be.equal('test');
                    expect(response.data.test2).to.be.equal('test2');
                }).
                should.eventually.be.fulfilled.notify(done);
            });

            it('and successes update', function(done) {
                var testObject = _.cloneDeep(TEST_OBJECT);

                testObject.newField = 'newField';
                testObject.test2 = null;

                return corbelDriver.resources.resource(COLLECTION, resourceId)
                .update(testObject)
                .should.eventually.be.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resourceId)
                    .get()
                    .should.eventually.be.fulfilled;
                })
                .then(function(response) {
                    expect(response.data._updatedAt).to.be.greaterThan(updatedAt);
                })
                .should.eventually.be.fulfilled.notify(done);
            });
        });
    });
});
