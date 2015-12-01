describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while trying get a resource', function() {
            var corbelDriver;
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl';
            var user;
            var adminUser;
            var resourceId;
            var random;
            var usersId;
            var groupId;
            var TEST_OBJECT;

            before(function(){
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
            });

            beforeEach(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                usersId = [];
                groupId = 'testGroup' + random;
                TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };

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
                    return corbelAdminDriver.resources.collection(COLLECTION_NAME)
                        .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    resourceId = id;
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                
                corbelTest.common.clients.loginUser
                    (corbelAdminDriver, adminUser.username, adminUser.password)
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
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
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN' 
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });

            it('if the user has WRITE permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN' 
                };
                ACL['user:' + user.id] = {
                    permission : 'WRITE' 
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });

            it('if the user has READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN' 
                };
                ACL['user:' + user.id] = {
                    permission : 'READ' 
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });                    

            it('if the users group has ADMIN permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });

            it('if the users group has WRITE permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });

            it('if the users group has READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['group:' + groupId] = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });

            it('a resource with ACL can be read with a client token if ALL has permission READ.', function(done) {

                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelTest.common.clients.loginUser
                        (corbelDriver, user.username, user.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.test', 'test' + random);
                    expect(response).to.have.deep.property('data.test2', 'test2' + random);
                })
                .should.notify(done);
            });

        //describe('a user can get all his resources', function() {

            //var amount = 5;
            //var newResourceId;
            //beforeEach(function() {
                //COLLECTION_NAME = 'test:testAcl' + timestamp;
            //});

            //var checkUserPermissionInResources = function(id, data) {
                //return data.some(function(resource) {
                    //var r = false;

                    //if ((resource._acl['user:' + id] !== undefined) &&
                        //(resource._acl['user:' + id] !== null) &&
                        //(resource._acl['user:' + id].permission === 'ADMIN')) {

                        //r = true;
                    //}
                    
                    //else if ((resource._acl.ALL !== undefined) &&
                        //(resource._acl.ALL !== null) &&
                        //(resource._acl.ALL === 'ADMIN')) {

                        //r = true;
                    //}

                    //return r;
                //});
            //};

            //var getAllResources = function(ACL, resourceId, sessionUser) {

                //return resourcesCommon.
                //createdObjectsToQuery(COLLECTION_NAME, amount).
                //should.be.eventually.fulfilled.
                //then(function() {
                        //return resources.collection(COLLECTION_NAME).
                        //get().
                        //should.be.eventually.fulfilled;
                    //})
                    //.then(function(data) {
                        //expect(data.length).to.be.equals(amount);
                        //expect(checkUserPermissionInResources(adminId, data)).
                        //to.be.equals(true);
                        //newResourceId = data[0].id;

                        //return resources.resource(COLLECTION_NAME, newResourceId).
                        //update(ACL, 'application/corbel.acl+json').
                        //should.be.eventually.fulfilled;
                    //})
                    //.then(function() {
                        //app.session.destroy();
                        //functionUtils.loadDefaultClient();
                        //functionUtils.loadDumpSession(sessionUser);

                        //return resources.collection(COLLECTION_NAME).
                        //get().
                        //should.be.eventually.fulfilled;
                    //})
                    //.then(function(data) {
                        //expect(data.length).to.be.equals(1);
                        //expect(data[0].id).to.be.equals(newResourceId);
                    //});
            //};


            //it('from collection with ACL', function(done) {
                //var ACL = {};
                //ACL['user:' + adminUser.id] = {
                    //permission : 'ADMIN' 
                //};
                //ACL['user:' + user.id] = {
                    //permission : 'ADMIN'
                //};

                //getAllResources(ACL, resourceId, sessionUser).
                //should.notify(results.to(done));
            //});

            //it('from collection with ACL (by group)', function(done) {
                //var ACL = {};
                //ACL['user:' + adminUser.id] = {
                    //permission : 'ADMIN'
                //};
                //ACL['group:' + groupId] = {
                    //permission : 'ADMIN'
                //};

                //getAllResources(ACL, resourceId, sessionUser).
                //should.notify(results.to(done));
            //});

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

            //it('adding a query', function(done) {
                //var params = {
                    //query: [{
                        //'$eq': {
                            //stringField: 'stringFieldContent1'
                        //}
                    //}]
                //};
                
                //resourcesCommon.createdObjectsToQuery(COLLECTION_NAME, 2).
                //should.be.eventually.fulfilled.
                //then(function() {
                    //return resources.collection(COLLECTION_NAME).
                    //get(params).
                    //should.be.eventually.fulfilled;
                //}).
                //then(function(data) {
                    //expect(data).to.be.an('array').and.have.length(1);
                    //expect(data).to.have.
                    //deep.property('[0].stringField', 'stringFieldContent1');

                    //expect(checkUserPermissionInResources(adminId, data)).
                    //to.be.equals(true);

                    //app.session.destroy();
                    //functionUtils.loadDefaultClient();
                    //functionUtils.loadDumpSession(sessionAdmin);

                    //return resources.collection(COLLECTION_NAME).
                    //get(params).
                    //should.be.eventually.fulfilled;
                //}).
                //then(function(data) {
                    //expect(data).to.be.an('array').and.have.length(1);
                    //expect(data).to.have.
                    //deep.property('[0].stringField', 'stringFieldContent1');
                //}).
                //should.notify(results.to(done));
            //});
        });
    });
});
