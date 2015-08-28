describe('In IAM module', function() {

    describe('for group api testing', function() {
        var corbelDriver;
        var corbelAdminDriver;
        var getGroup = function(suffix) {
            return {
                name: 'TestGroup_' + suffix,
                scopes: ['scope1', 'scope2']
            };
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_USER'];
            corbelAdminDriver = corbelTest.drivers['ADMIN_USER'];
        });

        it('when try to create a group without permission an error [401] is returned', function(done) {
            var group = getGroup(Date.now());

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when try to create a group that already exists an error [409] is returned', function(done) {
            var group = getGroup('equal');
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId.data;

                return corbelAdminDriver.iam.group()
                .create(group);
            })
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 409);
                expect(e).to.have.deep.property('data.error', 'conflict');
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelAdminDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when try to remove a group without premission an error [401] is returned', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId.data;

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

        it('when try to get a group without premission an error [401] is returned', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId.data;

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

        it('when try to get all groups without premission an error [401] is returned', function(done) {

            corbelDriver.iam.group()
            .getAll()
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('when try to get a group and it does not exist an error [404] is returned', function(done) {
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

        it('when try to add scopes in a group without premission an error [401] is returned', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId.data;

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

        it('when try to add scopes in a group and it does not exist an error [404] is returned', function(done) {
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

        it('when try to remove scopes in a group and it does not exist an error [404] is returned', function(done) {
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

        it('when try to remove scopes in a group without premission an error [401] is returned', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelAdminDriver.iam.group()
            .create(group)
            .then(function(createdId) {
                id = createdId.data;

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
