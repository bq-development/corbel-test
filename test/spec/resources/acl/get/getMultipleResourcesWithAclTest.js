describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while trying to get multiple resources from a collection', function() {
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var DOMAIN = 'silkroad-qa';
            var adminUser;
            var random;
            var usersId;
            var amount = 5;

            before(function(done){
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();

                var corbelUserDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                var user;
                
                corbelTest.common.iam.createUsers(corbelRootDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUsers) {
                    user = createdUsers[0];

                    return corbelTest.common.clients
                    .loginUser(corbelUserDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.setManagedCollection(
                        corbelRootDriver, corbelUserDriver, corbelTest.common.utils.retryFail,
                        DOMAIN, COLLECTION_NAME)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelRootDriver.iam.user(user).delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            after(function(done) {
                var corbelUserDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                var user;

                corbelTest.common.iam.createUsers(corbelRootDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUsers) {
                    user = createdUsers[0];

                    return corbelTest.common.clients
                    .loginUser(corbelUserDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.resources.unsetAndDeleteManagedCollection(
                        corbelRootDriver, corbelUserDriver, corbelTest.common.utils.retry,
                        DOMAIN, COLLECTION_NAME)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelRootDriver.iam.user(user).delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            beforeEach(function(done) {
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                usersId = [];

                corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    adminUser = createdUser[0];
                    usersId.push(adminUser.id);

                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelTest.common.resources.createdObjectsToQuery(corbelAdminDriver, COLLECTION_NAME, amount)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                
                corbelTest.common.clients.loginUser
                    (corbelAdminDriver, adminUser.username, adminUser.password)
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelTest.common.resources.cleanResourcesQuery(corbelAdminDriver)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    var promises = usersId.map(function(userId){
                        return corbelRootDriver.iam.user(userId)
                            .delete()
                        .should.be.eventually.fulfilled;
                    });

                    return Promise.all(promises);
                })
                .should.notify(done);
            });

            it('if the user has ADMIN permission', function(done) {

                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .get()
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                    response.data.map(function(resource){
                        expect(resource).to.have.property('_acl');
                    });
                })
                .should.notify(done);
            });

            it('the user can only access to the resources in which he has permissions', function(done) {
                var corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                var user;
                var resourceId;
                var ACL = {};
                var TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };

                corbelTest.common.iam.createUsers(corbelDriver, 1)
                .should.be.eventually.fulfilled
                .then(function(createdUser){
                    user = createdUser[0];
                    usersId.push(user.id);

                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION_NAME)
                        .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    resourceId = id;
                    ACL['user:' + user.id] = {
                        permission : 'ADMIN'
                    };
                    ACL['user:' + adminUser.id] = {
                        permission : 'ADMIN' 
                    };

                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function(createdUser) {
                    return corbelTest.common.clients.loginUser
                        (corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelAdminDriver.resources.collection(COLLECTION_NAME)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount + 1);
                    response.data.map(function(resource){
                        expect(resource).to.have.property('_acl');
                    });

                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.collection(COLLECTION_NAME)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    response.data.map(function(resource){
                        expect(resource).to.have.property('_acl');
                    });

                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('if the user has ADMIN permission and uses a query', function(done) {
                var params = {
                    query: [{
                        '$eq': {
                            stringField: 'stringFieldContent1'
                        }
                    }]
                };
                
                corbelAdminDriver.resources.collection(COLLECTION_NAME)
                    .get(params)
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0].stringField', 'stringFieldContent1');
                })
                .should.notify(done);
            });
        });
    });
});
