describe('In IAM module', function() {
    var corbelDriver;
    var corbelRootDriver;

    before(function() {
        corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('when testing group API', function() {
        var scope1;
        var scope2;
        var scope3;
        var scopes;

        var getGroup = function(suffix) {
            return {
                name: 'TestGroup_' + suffix,
                scopes: [scope1.id, scope2.id]
            };
        };

        beforeEach(function(done){
            scope1 = corbelTest.common.iam.getScope('scope1' + Date.now());
            scope2 = corbelTest.common.iam.getScope('scope2' + Date.now());
            scope3 = corbelTest.common.iam.getScope('scope3' + Date.now());
            scopes = [scope1, scope2, scope3];

            var promises = scopes.map(function(scope) {
                return corbelRootDriver.iam.scope()
                    .create(scope)
                    .should.be.eventually.fulfilled
                    .then(function(id){
                        expect(id).to.be.equal(scope.id);
                });
            });

            Promise.all(promises)
            .should.notify(done);
        });

        afterEach(function(done){
            var promises = scopes.map(function(scope) {
                return corbelRootDriver.iam.scope(scope.id)
                    .remove()
                    .should.be.eventually.fulfilled;
            });

            Promise.all(promises)
            .should.notify(done);
        });

        it('it is possible create and get a group', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.fulfilled
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedGroup) {
                expect(obtainedGroup).to.have.deep.property('data.id');
                expect(obtainedGroup).to.have.deep.property('data.name', group.name);
                expect(obtainedGroup).to.have.deep.property('data.scopes');

                obtainedGroup.data.scopes.forEach(function(scope) {
                    expect(obtainedGroup.data.scopes).to.contain(scope);
                });

                return corbelDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('it is possible create and get a group with empty scopes', function(done) {
            var group = getGroup(Date.now());
            group.scopes = [];
            var id;

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.fulfilled
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedGroup) {
                expect(obtainedGroup).to.have.deep.property('data.id');
                expect(obtainedGroup).to.have.deep.property('data.name', group.name);
                expect(obtainedGroup).to.have.deep.property('data.scopes.length', 0);

                return corbelDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('it is possible create and get a group without scopes', function(done) {
            var group = getGroup(Date.now());
            delete group.scopes;
            var id;

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.fulfilled
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedGroup) {
                expect(obtainedGroup).to.have.deep.property('data.id');
                expect(obtainedGroup).to.have.deep.property('data.name', group.name);
                expect(obtainedGroup).to.not.have.deep.property('data.scopes');

                return corbelDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('it is possible remove a group', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.fulfilled
            .then(function(createdId) {
                id = createdId;

                return corbelDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.group(id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'group_not_exists');
            })
            .should.notify(done);
        });

        it('it is possible update a group', function(done) {
            var group = getGroup(Date.now());
            var id;

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.fulfilled
            .then(function(obtainedId) {
                id = obtainedId;

                return corbelDriver.iam.group(id)
                .addScopes([scope3.id])
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.group(id)
                .removeScope(scope1.id)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.group(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedGroup) {
                expect(obtainedGroup).to.have.deep.property('data.scopes');
                expect(obtainedGroup).to.have.deep.property('data.scopes.length', 2);
                expect(obtainedGroup.data.scopes).to.contain(scope2.id);
                expect(obtainedGroup.data.scopes).to.contain(scope3.id);

                return corbelDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('an scope is deleted and it dissapears from the group', function(done) {
            var group = getGroup(Date.now());
            var id;
            var scopeId;

            corbelDriver.iam.group()
            .create(group)
            .should.be.eventually.fulfilled
            .then(function(obtainedId) {
                id = obtainedId;

                return corbelRootDriver.iam.scope(scope1.id)
                .remove()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.group(id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedGroup) {
                expect(obtainedGroup).to.have.deep.property('data.scopes');
                expect(obtainedGroup).to.have.deep.property('data.scopes.length', 1);
                expect(obtainedGroup.data.scopes).to.contain(scope2.id);

                return corbelDriver.iam.group(id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('it is possible invoke getAll operation with params', function(done) {
            var timeStamp = Date.now();
            var group1 = getGroup('1_' + timeStamp);
            var group2 = getGroup('2_' + timeStamp);
            var group1id;
            var group2id;

            corbelDriver.iam.group()
            .create(group1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                group1id = id;

                return corbelDriver.iam.group()
                .create(group2)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                group2id = id;

                return corbelDriver.iam.group()
                .getAll({
                    query: [{
                        '$like': {
                            'name': group1.name
                        }
                    }]
                })
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedGroups) {
                expect(obtainedGroups).to.have.deep.property('data.length', 1);
                expect(obtainedGroups).to.have.deep.property('data[0].id', group1id);

                return corbelDriver.iam.group(group1id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.group(group2id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('it is possible invoke getAll operation without params', function(done) {
            var timeStamp = Date.now();
            var group1 = getGroup('1_' + timeStamp);
            var group2 = getGroup('2_' + timeStamp);
            var group1id;
            var group2id;

            corbelDriver.iam.group()
            .create(group1)
            .should.be.eventually.fulfilled
            .then(function(id) {
                group1id = id;

                return corbelDriver.iam.group()
                .create(group2)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                group2id = id;

                return corbelDriver.iam.group()
                .getAll()
                .should.be.eventually.fulfilled;
            })
            .then(function(obtainedGroups) {
                expect(obtainedGroups.data.length).to.be.above(1);

                return corbelDriver.iam.group(group1id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.group(group2id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});
