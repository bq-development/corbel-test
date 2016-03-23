describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing ACL permission validations', function() {
            var corbelDriver;
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
            var DOMAIN = 'silkroad-qa';
            var user;
            var adminUser;
            var resourceId;
            var random;
            var usersId;
            var groupId;
            var TEST_OBJECT;
            var aclConfigurationId;

            before(function(done) {
                corbelRootDriver = corbelTest.drivers['ADMIN_USER'].clone();
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelAdminDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                random = Date.now();
                usersId = [];
                groupId = 'testGroup' + random;
                TEST_OBJECT = {
                    test: 'test' + random,
                    test2: 'test2' + random
                };
                
                corbelTest.common.resources.setManagedCollection(
                    corbelRootDriver, DOMAIN, COLLECTION_NAME)
                .should.be.eventually.fulfilled
                .then(function(id){
                    aclConfigurationId = id;
                    return corbelTest.common.iam.createUsers(corbelAdminDriver, 1)
                    .should.be.eventually.fulfilled;
                })
                .then(function(createdUser) {
                    adminUser = createdUser[0];
                    usersId.push(adminUser.id);

                    return corbelTest.common.iam.createUsers(corbelDriver, 1, {'groups': [groupId]})
                    .should.be.eventually.fulfilled;
                })
                .then(function(createdUser){
                    user = createdUser[0];
                    usersId.push(user.id);

                    return corbelTest.common.clients.loginUser(
                        corbelAdminDriver, adminUser.username, adminUser.password)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelTest.common.clients.loginUser(
                        corbelDriver, user.username, user.password)
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

            after(function(done) {

                corbelTest.common.resources.unsetManagedCollection(
                    corbelRootDriver, DOMAIN, COLLECTION_NAME, aclConfigurationId)
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelRootDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    var promises = usersId.map(function(userId){
                        return corbelRootDriver.iam.user(userId)
                            .delete();
                    });

                    return Promise.all(promises)
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });

            it('the user\'s permissions of a resource can be updated to READ', function(done) {
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
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','READ');
                })
                .should.notify(done);
            });

            it('the user\'s permissions of a resource can be updated to WRITE', function(done) {
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
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','WRITE');
                })
                .should.notify(done);
            });

            it('the user\'s permissions of a resource can be updated to ADMIN', function(done) {
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
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('the group\'s permissions of a resource can be updated to ADMIN', function(done) {
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
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.group:' + groupId + '.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('the group\'s permissions of a resource can be updated to READ', function(done) {
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
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.group:' + groupId + '.permission','READ');
                })
                .should.notify(done);
            });

            it('the group\'s permissions of a resource can be updated to WRITE', function(done) {
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
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.group:' + groupId + '.permission','WRITE');
                })
                .should.notify(done);
            });

            it('a resource\'s permissions can be updated with properties', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN',
                    properties : {
                        alias : 'first.admin@email.com'
                    }
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN',
                    properties : {
                        alias : 'second.admin@email.com'
                    }
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property
                        ('data._acl.user:' + adminUser.id + '.properties.alias', 'first.admin@email.com');
                    expect(response).to.have.deep.property
                        ('data._acl.user:' + user.id + '.properties.alias', 'second.admin@email.com');
                })
                .should.notify(done);
            });

            it('a resource\'s permissions can be updated to ADMIN for ALL users', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] =  {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.ALL.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('a resource\'s permissions can be updated to WRITE for ALL users', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] =  {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.ALL.permission','WRITE');
                })
                .should.notify(done);
            });

            it('a resource\'s permissions can be updated to READ for ALL users', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] =  {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.ALL.permission','READ');
                })
                .should.notify(done);
            });

            it('a resource\'s permissions can be updated to ADMIN for ALL users without explicit ADMIN userId',
                   function(done) {
                var ACL = {};
                ACL.ALL = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.ALL.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('update is ignored if acl permissions entity is malformed', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] =  {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'malformed'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).not.to.have.deep.property('data._acl.ALL');
                })
                .should.notify(done);
            });

            it('update is ignored if the acl updated field is malformed', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] =  {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    'malformed' : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).not.to.have.deep.property('data._acl.ALL');
                })
                .should.notify(done);
            });

            it('an ACL resource can be updated with empty data and the admin persists', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] =  {
                    permission : 'ADMIN'
                };
                ACL.ALL = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.ALL.permission','READ');
                })
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update({}, {dataType: 'application/corbel.acl+json'})
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('a resource can be updated without admin user in the ACL and the admin persists', function(done) {
                var ACL = {};
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('the admin update is ignored when trying to assign him WRITE permissions', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'WRITE'
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get().should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('the admin update is ignored when trying to assign him READ permissions', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'READ'
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get().should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('an ACL resource can be updated for all users with READ permission', function(done) {
                var ACL = {};
                ACL.ALL = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get().should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.ALL.permission','READ');
                })
                .should.notify(done);
            });

            it('an ACL resource can be updated for all users with WRITE permission', function(done) {
                var ACL = {};
                ACL.ALL = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .update({}).should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get().should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.ALL.permission','WRITE');
                })
                .should.notify(done);
            });

            it('an ACL resource can be updated for a group with READ permission',
                    function(done) {
                var ACL = {};
                ACL['group:' + groupId] = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.group:' + groupId + '.permission','READ');
                })
                .should.notify(done);
            });

            it('an ACL resource can be updated for a group with WRITE permission',
                    function(done) {
                var ACL = {};
                ACL['group:' + groupId] = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.group:' + groupId + '.permission','WRITE');
                })
                .should.notify(done);
            });

            it('an ACL resource can be updated for a group with ADMIN permission',
                    function(done) {
                var ACL = {};
                ACL['group:' + groupId] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelDriver.resources.resource(COLLECTION_NAME, resourceId)
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.group:' + groupId + '.permission','ADMIN');
                })
                .should.notify(done);
            });

            it('a resource is created when a non existent ACL resource is updated', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, 'nonExistent')
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.fulfilled
                .then(function(){
                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, 'nonExistent')
                        .get()
                    .should.be.eventually.fulfilled;
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data._acl.user:' + adminUser.id + '.permission','ADMIN');
                    expect(response).to.have.deep.property('data._acl.user:' + user.id + '.permission','ADMIN');

                    return corbelAdminDriver.resources.resource(COLLECTION_NAME, 'nonExistent')
                        .delete()
                    .should.be.eventually.fulfilled;
                })
                .should.notify(done);
            });
        });
    });
});
