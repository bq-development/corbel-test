describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while trying to get multiple resources from a collection', function() {
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var adminUser;
            var random;
            var usersId;
            var amount = 5;

            before(function(){
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
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

            //it('but only his resources', function(done) {
                //var ACL = {};
                //ACL['user:' + adminUser.id] = {
                    //permission : 'ADMIN' 
                //};
                //ACL['user:' + user.id] = {
                    //permission : 'ADMIN'
                //};

                //getAllResources(ACL, resourceId, sessionUser).
                //then(function() {
                    //return resourcesCommon.createdObjectsToQuery(COLLECTION_NAME, 2).
                    //should.be.eventually.fulfilled;
                //}).
                //then(function() {
                    //return resources.collection(COLLECTION_NAME).
                    //get().
                    //should.be.eventually.fulfilled;
                //}).
                //then(function(data) {
                    //expect(data.length).to.be.equals(3);

                    //expect(checkUserPermissionInResources(userId, data)).
                    //to.be.equals(true);

                    //app.session.destroy();
                    //functionUtils.loadDefaultClient();
                    //functionUtils.loadDumpSession(sessionAdmin);

                    //return resources.collection(COLLECTION_NAME).
                    //get().
                    //should.be.eventually.fulfilled;
                //}).
                //then(function(data) {
                    //expect(data.length).to.be.equals(5);
                //}).
                //should.notify(results.to(done));
            //});

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
