describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while trying to stablish a collection as acl', function() {
            var corbelRootDriver;
            var corbelAdminDriver;
            var corbelDriver;
            var MAX_RETRY = 30;
            var RETRY_PERIOD = 5;
            var TEST_OBJECT;
            var DOMAIN = 'silkroad-qa';
            var ACL_ADMIN_COLLECTION = 'acl:Configuration';
            var RELATION = 'other';
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var adminObjectId = DOMAIN + ':' + COLLECTION_NAME;
            var random;
            var user;
            var adminUser;
            var usersId = [];
            var groupId;
            var resourceId;

            before(function(done) {
                corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                groupId = 'testGroup' + random;

                corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    adminUser = createdUser[0];
                    usersId.push(adminUser.id);

                    return corbelTest.common.iam.createUsers(corbelDriver, 1, {'groups': [groupId]})
                    .should.be.eventually.fulfilled;
                })
                .then(function(createdUser){
                    user = createdUser[0];
                    usersId.push(user.id);

                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            beforeEach(function(done) {
                TEST_OBJECT = {
                    _acl: {},
                    test: 'test' + random,
                    test2: 'test2' + random
                };

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .add(TEST_OBJECT)
                .should.be.eventually.fulfilled
                .then(function(id) {
                    resourceId = id;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                
                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .delete()
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelRootDriver.resources.resource(ACL_ADMIN_COLLECTION, adminObjectId)
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            after(function(done) {
                var promises = usersId.map(function(userId){
                    return corbelRootDriver.iam.user(userId)
                        .delete()
                    .should.be.eventually.fulfilled;
                });

                Promise.all(promises)
                .should.notify(done);
            });

            it('a collection is established as acl and user permissions are applied', function(done) {
                corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION)
                    .add({
                        id: adminObjectId,
                        users: [adminUser.id],
                        groups: []
                    })
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelTest.common.utils.retryFail(function() {
                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .get();
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled;
                })
                .then(function(e){
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.relation(COLLECTION_NAME, resourceId, RELATION)
                            .get().should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelRootDriver.resources.resource(ACL_ADMIN_COLLECTION, adminObjectId)
                        .update({
                            id: adminObjectId,
                            users: [adminUser.id, user.id],
                            groups: []
                        })
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .get();
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id', resourceId);
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);

                    return corbelDriver.resources.relation(COLLECTION_NAME, resourceId, RELATION)
                            .get().should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('a collection is established as acl and group permissions are applied', function(done) {
                corbelRootDriver.resources.collection(ACL_ADMIN_COLLECTION)
                    .add({
                        id: adminObjectId,
                        users: [adminUser.id],
                        groups: []
                    })
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelTest.common.utils.retryFail(function() {
                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .get();
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.relation(COLLECTION_NAME, resourceId, RELATION)
                            .get().should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelRootDriver.resources.resource(ACL_ADMIN_COLLECTION, adminObjectId)
                        .update({
                            id: adminObjectId,
                            users: [adminUser.id],
                            groups: [groupId]
                        })
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.utils.retry(function() {
                        return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                            .get();
                    }, MAX_RETRY, RETRY_PERIOD)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.id', resourceId);
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);

                    return corbelDriver.resources.relation(COLLECTION_NAME, resourceId, RELATION)
                            .get().should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
        });
    });
});
