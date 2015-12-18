describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing delete resources', function() {
            var corbelDriver;
            var corbelRootDriver;
            var corbelCreatorDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var DOMAIN = 'silkroad-qa';
            var user;
            var creatorCollectionUser;
            var resourceId;
            var random;
            var usersId;
            var TEST_OBJECT;

            before(function(done){
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
                corbelCreatorDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                
                corbelTest.common.iam.createUsers(corbelRootDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUsers) {
                    creatorCollectionUser = createdUsers[0];

                    return corbelTest.common.clients
                        .loginUser(corbelCreatorDriver, creatorCollectionUser.username, creatorCollectionUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.setManagedCollection(
                        corbelRootDriver, corbelCreatorDriver, DOMAIN, COLLECTION_NAME)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            beforeEach(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                usersId = [];
                TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };

                corbelTest.common.iam.createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    user = createdUser[0];
                    usersId.push(user.id);

                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                var promises = usersId.map(function(userId){
                    return corbelRootDriver.iam.user(userId)
                        .delete()
                    .should.be.eventually.fulfilled;
                });

                Promise.all(promises)
                .should.notify(done);
            });

            after(function(done) {

                corbelTest.common.clients
                    .loginUser(corbelCreatorDriver, creatorCollectionUser.username, creatorCollectionUser.password)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.resources.unsetAndDeleteManagedCollection(
                        corbelRootDriver, corbelCreatorDriver, DOMAIN, COLLECTION_NAME)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelRootDriver.iam.user(creatorCollectionUser).delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('a resource with ACL can be deleted as ADMIN', function(done) {

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

                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });

            it('a resource with ACL can be deleted if the admin permission is for ALL users', function(done) {
                var adminUser;
                var corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();

                corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    adminUser = createdUser[0];
                    usersId.push(adminUser.id);

                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelAdminDriver.resources.collection(COLLECTION_NAME)
                        .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    resourceId = id;

                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var ACL = {
                        ALL:  {
                            permission : 'ADMIN'
                        }
                    };

                    ACL['user:' + adminUser.id] = {
                        permission : 'ADMIN'
                    };

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                }).
                then(function() {
                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });


            it('a not json resource with ACL can be deleted', function(done) {
                var FILE_CONTENT = 'this Is My fileee!!! ññáaäéó' + random;

                corbelDriver.resources.collection(COLLECTION_NAME)
                    .add(FILE_CONTENT, {dataType: 'application/xml'})
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;

                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get({dataType: 'application/xml'})
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data', FILE_CONTENT);
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete({dataType: 'application/xml'})
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get({dataType: 'application/xml'})
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });
        });
    });
});
