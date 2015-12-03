describe('In RESOURCES module', function() {

    describe('In ACL module', function() {

        describe('while testing ACL permission validations', function() {
            var corbelDriver;
            var corbelAdminDriver;
            var corbelRootDriver;
            var COLLECTION_NAME = 'test:testAcl' + Date.now();
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

            it('an ACL resource can not be updated if the admin user is not in the ACL', function(done) {
                var ACL = {};
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an ACL resource can not be updated if the admin is in the ACL with WRITE permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'WRITE'
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an ACL resource can not be updated if the admin is in the ACL with READ permission', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'READ'
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an ACL resource can not be updated for all users with READ permission if the admin is not in the ACL',
                    function(done) {

                var ACL = {};
                ACL.ALL = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an ACL resource can not be updated for all users with WRITE permission if the admin is not in the ACL',
                    function(done) {
                var ACL = {};
                ACL.ALL = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an ACL resource can not be updated for a group with READ permission if the admin is not in the ACL',
                    function(done) {

                var ACL = {};
                ACL['group:' + groupId] = {
                    permission : 'READ'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an ACL resource can not be updated for a group with WRITE permission if the admin is not in the ACL',
                    function(done) {
                var ACL = {};
                ACL['group:' + groupId] = {
                    permission : 'WRITE'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an ACL resource can not be updated for a group with ADMIN permission if the admin is not in the ACL',
                    function(done) {
                var ACL = {};
                ACL['group:' + groupId] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });

            it('an error 404 is returned when trying to update a non existent ACL resource', function(done) {
                var ACL = {};
                ACL['user:' + adminUser.id] = {
                    permission : 'ADMIN'
                };
                ACL['user:' + user.id] = {
                    permission : 'ADMIN'
                };

                corbelAdminDriver.resources.resource(COLLECTION_NAME, 'nonExistent')
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });

            it('an error 422 is returned when trying to update an ACL resource with string data', function(done) {
                var ACL = 'invalid';

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 422);
                    expect(e).to.have.deep.property('data.error', 'invalid_entity');
                })
                .should.notify(done);
            });

            it('an error 400 is returned when trying to update an ACL resource with empty data', function(done) {
                var ACL = {};

                corbelAdminDriver.resources.resource(COLLECTION_NAME, resourceId)
                    .update(ACL, {dataType: 'application/corbel.acl+json'})
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'bad_request');
                })
                .should.notify(done);
            });
        });
    });
});
