describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing create resources', function() {
            var corbelDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var user;
            var resourceId;
            var random;

            before(function(){
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
            });

            beforeEach(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();

                corbelTest.common.iam.createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    user = createdUser[0];

                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .delete()
                .should.be.eventually.fulfilled
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
