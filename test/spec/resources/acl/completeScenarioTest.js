describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing complete scenario', function() {
            var corbelDriver;
            var corbelRootDriver;
            var resource1Id;
            var resource2Id;
            var usersId = [];
            var COLLECTION = 'test:testAcl' + Date.now();
            var dataType = {dataType: 'application/corbel.acl+json'};
            var dataTypePng = {dataType: 'image/png'};
            var TEST_OBJECT = {
                test: 'test',
                test2: 'test2'
            };
            var userCreator, userRead, userWrite, userAdmin, userReadFromAdmin, suspiciousUser;

            var TEST_OBJECT_TEXT = '<xml>My project!</xml>';

            before(function(done){
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                var random = Date.now();
                var TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };

                corbelTest.common.iam.createUsers(corbelDriver, 6)
                .should.be.eventually.fulfilled
                .then(function(createdUser) {
                    userCreator = createdUser[0];
                    userRead = createdUser[1];
                    userWrite = createdUser[2];
                    userAdmin = createdUser[3];
                    userReadFromAdmin = createdUser[4];
                    suspiciousUser = createdUser[5];
                    usersId.push(userCreator.id, userRead.id, userWrite.id, 
                            userAdmin.id, userReadFromAdmin.id, suspiciousUser.id);
                })
                .should.notify(done);
            });

            afterEach(function(done) {
                
                corbelTest.common.clients.loginUser
                    (corbelDriver, userCreator.username, userCreator.password)
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .delete(dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION, resource2Id)
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

            it('a full application scenario is simulated', function(done) {
                corbelTest.common.clients.loginUser
                    (corbelDriver, userCreator.username, userCreator.password)
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION)
                        .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    resource1Id = id;

                    return corbelDriver.resources.collection(COLLECTION)
                        .add(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function(id) {
                    resource2Id = id;
                    var params = {
                        query: [{}, {}]
                    };
                    params.query[0]['_acl.user:' + userCreator.id + '.permission'] = 'ADMIN';
                    params.query[1]['_acl.user:' + userCreator.id + '.permission'] = 'ADMIN';

                    return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 2);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(TEST_OBJECT_TEXT, dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + userCreator.id + '.permission', 'ADMIN');
                    expect(response).to.have.property('data').and.to.include(TEST_OBJECT);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data',TEST_OBJECT_TEXT);
                    var ACL = {};
                    ACL['user:' + userCreator.id] = {
                        permission: 'ADMIN'
                    };
                    ACL['user:' + userRead.id] = {
                        permission: 'READ',
                        properties: {
                            alias: userRead.email
                        }
                    };
                    ACL['user:' + userWrite.id] = {
                        permission: 'WRITE',
                        properties: {
                            alias: userWrite.email
                        }
                    };
                    ACL['user:' + userAdmin.id] = {
                        permission: 'ADMIN',
                        properties: {
                            alias: userAdmin.email
                        }
                    };

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(ACL, dataType)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userCreator.id + '.permission', 'ADMIN');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userRead.id + '.permission', 'READ');
                    expect(response).to.have.deep.property
                        ('data._acl.user:' + userRead.id + '.properties.alias', userRead.email);
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userWrite.id + '.permission', 'WRITE');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userWrite.id + '.properties.alias', userWrite.email);
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userAdmin.id + '.permission', 'ADMIN');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userAdmin.id + '.properties.alias', userAdmin.email);

                    return corbelTest.common.clients.loginUser
                        (corbelDriver, userRead.username, userRead.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userCreator.id + '.permission', 'ADMIN');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userRead.id + '.permission', 'READ');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userRead.id + '.properties.alias', userRead.email);
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userWrite.id + '.permission', 'WRITE');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userWrite.id + '.properties.alias', userWrite.email);
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userAdmin.id + '.permission', 'ADMIN');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userAdmin.id + '.properties.alias', userAdmin.email);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data',TEST_OBJECT_TEXT);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update({})
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .delete()
                    .should.be.eventually.rejected;
                }).then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(TEST_OBJECT_TEXT, dataTypePng)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                    var ACL = {};
                    ACL['user:' + userCreator.id] = {
                        permission: 'ADMIN'
                    };
                    ACL['user:' + userRead.id] = {
                        permission: 'READ',
                        properties: {
                            alias: userRead.email
                        }
                    };
                    ACL['user:' + userWrite.id] = {
                        permission: 'WRITE',
                        properties: {
                            alias: userWrite.email
                        }
                    };
                    ACL['user:' + userAdmin.uid] = {
                        permission: 'ADMIN',
                        properties: {
                            alias: userAdmin.email
                        }
                    };

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(ACL, dataType)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelTest.common.clients.loginUser(
                        corbelDriver, userWrite.username, userWrite.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data').and.to.contain(TEST_OBJECT);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data',TEST_OBJECT_TEXT);
                    TEST_OBJECT.filed3 = 3;

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data').and.to.contain(TEST_OBJECT);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .delete()
                        .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                    TEST_OBJECT_TEXT = 'new text';

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(TEST_OBJECT_TEXT, dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data',TEST_OBJECT_TEXT);
                    var ACL = {};
                    ACL['user:' + userCreator.id] = {
                        permission: 'ADMIN'
                    };
                    ACL['user:' + userRead.id] = {
                        permission: 'READ'
                    };
                    ACL['user:' + userWrite.id] = {
                        permission: 'WRITE'
                    };
                    ACL['user:' + userAdmin.id] = {
                        permission: 'ADMIN'
                    };

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(ACL, dataType)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelTest.common.clients.loginUser(
                        corbelDriver, userAdmin.username, userAdmin.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data').and.to.contain(TEST_OBJECT);
                    var params = {
                        query: [{}, {}]
                    };
                    params.query[0]['_acl.user:' + userCreator.id + '.permission'] = 'ADMIN';
                    params.query[1]['_acl.user:' + userCreator.id + '.permission'] = 'ADMIN';

                    return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                    expect(response).to.have.deep.property('data[0]').and.to.contain(TEST_OBJECT);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data',TEST_OBJECT_TEXT);
                    TEST_OBJECT.filed4 = 4;

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data').and.to.contain(TEST_OBJECT);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(TEST_OBJECT)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var ACL = {};
                    ACL['user:' + userCreator.id] = {
                        permission: 'ADMIN'
                    };
                    ACL['user:' + userRead.id] = {
                        permission: 'READ',
                        properties: {
                            alias: userRead.email
                        }
                    };
                    ACL['user:' + userWrite.id] = {
                        permission: 'WRITE',
                        properties: {
                            alias: userWrite.email
                        }
                    };
                    ACL['user:' + userAdmin.id] = {
                        permission: 'ADMIN',
                        properties: {
                            alias: userAdmin.email
                        }
                    };
                    ACL['user:' + userReadFromAdmin.id] = {
                        permission: 'READ',
                        properties: {
                            alias: userReadFromAdmin.email
                        }
                    };

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(ACL, dataType)
                        .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userCreator.id + '.permission', 'ADMIN');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userRead.id + '.permission', 'READ');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userRead.id + '.properties.alias', userRead.email);
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userWrite.id + '.permission', 'WRITE');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userWrite.id + '.properties.alias', userWrite.email);
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userAdmin.id + '.permission', 'ADMIN');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userAdmin.id + '.properties.alias', userAdmin.email);
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userReadFromAdmin.id + '.permission', 'READ');
                    expect(response).to.have.deep.property(
                            'data._acl.user:' + userReadFromAdmin.id + '.properties.alias', userReadFromAdmin.email);

                    return corbelTest.common.clients.loginUser(
                        corbelDriver, userReadFromAdmin.username, userReadFromAdmin.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data').and.to.contain(TEST_OBJECT);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.property('data',TEST_OBJECT_TEXT);
                    var params = {
                        query: [{$EXISTS : {}}]
                    };
                    params.query[0].$EXISTS['_acl.user:' + userRead.id + '.permission'] = true;

                    return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update({})
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelTest.common.clients.loginUser(
                        corbelDriver, userAdmin.username, userAdmin.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var ACL = {};
                    ACL['user:' + userCreator.id] = {
                        permission: 'ADMIN'
                    };
                    ACL['user:' + userRead.id] = {
                        permission: 'READ',
                        properties: {
                            alias: userRead.email
                        }
                    };
                    ACL['user:' + userWrite.id] = {
                        permission: 'WRITE',
                        properties: {
                            alias: userWrite.email
                        }
                    };
                    ACL['user:' + userAdmin.id] = {
                        permission: 'ADMIN',
                        properties: {
                            alias: userAdmin.email
                        }
                    };
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(ACL, dataType)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelTest.common.clients.loginUser(
                        corbelDriver, userReadFromAdmin.username, userReadFromAdmin.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelTest.common.clients.loginUser(
                        corbelDriver, suspiciousUser.username, suspiciousUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    var ACL = {};
                    ACL['user:' + userCreator.id] = {
                        permission: 'ADMIN'
                    };
                    ACL['user:' + userRead.id] = {
                        permission: 'READ',
                        properties: {
                            alias: userRead.email
                        }
                    };
                    ACL['user:' + userWrite.id] = {
                        permission: 'WRITE',
                        properties: {
                            alias: userWrite.email
                        }
                    };
                    ACL['user:' + userAdmin.id] = {
                        permission: 'ADMIN',
                        properties: {
                            alias: userAdmin.email
                        }
                    };

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update(ACL, dataType)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelTest.common.clients.loginUser(
                        corbelDriver, userReadFromAdmin.username, userReadFromAdmin.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function() {
                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .get(dataTypePng)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update({})
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .update('tt', dataTypePng)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .delete()
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');

                    return corbelDriver.resources.resource(COLLECTION, resource1Id)
                        .delete(dataTypePng)
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                    var params = {
                        query: [{}, {}]
                    };
                    params.query[0]['_acl.user:' + userCreator.id + '.permission'] = 'ADMIN';
                    params.query[1]['_acl.user:' + userCreator.id + '.permission'] = 'ADMIN';

                    return corbelDriver.resources.collection(COLLECTION)
                        .get(params)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });
        });
    });
});
