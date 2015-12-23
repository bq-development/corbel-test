describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing create resources', function() {
            var corbelDriver, corbelRootDriver;
            var DOMAIN = 'silkroad-qa';
            var COLLECTION_NAME = 'test:testAcl_' + Date.now();
            var user, resourceId, random;

            before(function(done) {
                corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();

                corbelTest.common.iam.createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    user = createdUser[0];

                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.setManagedCollection(
                        corbelRootDriver, DOMAIN, COLLECTION_NAME)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            after(function(done) {
                return corbelTest.common.resources.unsetManagedCollection(
                    corbelRootDriver, DOMAIN, COLLECTION_NAME)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelRootDriver.iam.user(user.id)
                    .delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('a resource can be created with ACL', function(done) {
                var TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };

                corbelDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','ADMIN');
                })
                .should.notify(done);
            });
        });
    });
});
