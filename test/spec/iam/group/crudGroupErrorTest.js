describe('In IAM module', function() {
    var corbelDriver;
    var corbelAdminDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_USER'];
        corbelAdminDriver = corbelTest.drivers['ADMIN_USER'];
    });

    describe('when testing group API', function() {
        var scope1 = corbelTest.common.iam.getScope('scope1');
        var scope2 = corbelTest.common.iam.getScope('scope2');
        var promise = Promise.resolve();

        var getGroup = function(suffix) {
            suffix = suffix || Date.now();
            return {
                name: 'TestGroup_' + suffix,
                scopes: ['scope1', 'scope2']
            };
        };

        beforeEach(function(){
            [scope1, scope2].forEach(function(scope) {
                    promise = promise.then(function() {
                        return corbelAdminDriver.iam.scope()
                        .create(scope)
                        .should.be.eventually.fulfilled;
                    });
            });
        });

        afterEach(function(){
            [scope1, scope2].forEach(function(scope) {
                    promise = promise.then(function() {
                        return corbelAdminDriver.iam.scope()
                        .remove(scope)
                        .should.be.eventually.fulfilled;
                    });
            });
        });

        it('an error [401] is returned when tryinging to create a group without propper permissions', function(done) {
            var group = getGroup();

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [409] is returned when trying to create a group that already exists', function(done) {
            var group = getGroup();
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .should.be.eventually.fulfilled
            .then(function(createdId) {
                id = createdId;

                return corbelAdminDriver.iam.group()
                .create(group);
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'group_already_exists');
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [400] is returned when trying to create a group with unexistent scopes', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelAdminDriver.iam.group()
            .create({
                name: 'TestGroup_' + Date.now(),
                scopes: ['unexistentScope']
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 400);
                expect(e).to.have.deep.property('data.error', 'not_existent_scope');
            })
            .should.notify(done);
        });

        it('an error [401] is returned when trying to remove a group without propper permissions', function(done) {
            var group = getGroup();
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .delete();
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [401] is returned when trying to get a group without propper permissions', function(done) {
            var group = getGroup();
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .get();
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [401] is returned when trying to get all groups without propper permissions', function(done) {

            corbelDriver.iam.group()
            .getAll()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [404] is returned when trying to get a group and it does not exist', function(done) {
            var id = 'asdfasdf';

            corbelAdminDriver.iam.group(id)
            .get()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'group_not_exists');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [401] is returned when trying to add scopes in a group without permissions', function(done) {
            var group = getGroup();
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .addScopes(['newScope']);
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [404] is returned when trying to add scopes in a group and it does not exist', function(done) {
            var id = 'asdfasdf';

            corbelAdminDriver.iam.group(id)
            .addScopes(['newScope'])
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'group_not_exists');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [404] is returned when trying to remove scopes in a group and it does not exist', function(done) {
            var id = 'asdfasdf';

            corbelAdminDriver.iam.group(id)
            .removeScope('scope1')
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'group_not_exists');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('an error [401] is returned when trying to remove scopes in a group without permissions', function(done) {
            var group = getGroup();
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .removeScope('scope1');
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
