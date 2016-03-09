describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('with acl collections management', function() {

            var userId, user;
            var ACL_ADMIN_COLLECTION = 'acl:Configuration';
            var COLLECTION_NAME_1 = 'test:testAcl' + Date.now();
            var COLLECTION_NAME_2 = 'test:testAcl' + Date.now();
            var managedCollectionId1, managedCollectionId2;
            var corbelRootDriver, corbelDriver;
            var random;

            before(function(done) {
                corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
                // corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();

                corbelTest.common.iam.createUsers(corbelDriver, 1)
                    .should.be.eventually.fulfilled
                    .then(function(createdUser) {
                        user = createdUser[0];
                        userId = user.id;

                        return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                            .should.be.eventually.fulfilled;
                    })
                    .should.notify(done);
            });


            after(function(done) {
                return corbelRootDriver.iam.user(userId)
                    .delete()
                    .should.be.eventually.fulfilled
                    .and.notify(done);
            });

            beforeEach(function(done) {
                var TEST_OBJECT = {
                    _acl: {},
                    test: 'test' + random,
                    test2: 'test2' + random
                };
                corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION)
                    .add({
                        collectionName: COLLECTION_NAME_1,
                        users: [],
                        groups: [],
                        defaultPermission: 'NONE'
                    })
                    .should.be.eventually.fulfilled
                    .then(function(id) {
                        managedCollectionId1 = id;
                        return corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION)
                            .add({
                                collectionName: COLLECTION_NAME_2,
                                users: [],
                                groups: [],
                                defaultPermission: 'NONE'
                            })
                            .should.be.eventually.fulfilled;
                    })
                    .then(function(id) {
                        managedCollectionId2 = id;
                    })
                    .should.notify(done);
            });

            afterEach(function(done) {
                corbelRootDriver.resources.resource(ACL_ADMIN_COLLECTION, managedCollectionId1)
                    .delete()
                    .should.be.eventually.fulfilled.then(function() {
                        return corbelRootDriver.resources.resource(ACL_ADMIN_COLLECTION, managedCollectionId2)
                            .delete()
                            .should.be.eventually.fulfilled;
                    }).should.notify(done);
            });

            it('admin can get all the collection managed of his domain', function(done) {
            	var params = {
                    sort: {
                        '_createdAt': 'asc'
                    }
                };
                corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION).get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
 					expect(response.data.length).to.be.at.least(2);
                    expect(response.data[0].collectionName).to.be.equal(COLLECTION_NAME_1);
                    expect(response.data[1].collectionName).to.be.equal(COLLECTION_NAME_2);
                }).should.notify(done);
            });
        });
    });
});