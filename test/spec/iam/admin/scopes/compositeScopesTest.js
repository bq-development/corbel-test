describe('In IAM module', function() {

    describe('when performing composite scopes CRUD operations', function() {
        var corbelDriver;
        var compositeScope;

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        describe('while testing composite scope creation', function() {
            
            after(function(done) {
                corbelDriver.iam.scope(compositeScope.id).remove()
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            it('a composite scope can be created', function(done){
                compositeScope = {
                    id: 'compositeScopeTest_' + Date.now(),
                    type: 'composite_scope',
                    scopes: ['iam:user:create', 'iam:user:read', 'iam:user:delete', 'iam:user:me']
                };

                corbelDriver.iam.scope().create(compositeScope)
                    .should.be.eventually.fulfilled
                    .then(function (id){
                        expect(id).to.equal(compositeScope.id);
                    })
                    .should.notify(done);
            });
        });

        describe('while testing composite scope reading', function() {

            before(function(done){
                compositeScope = corbelTest.common.iam.getCompositeScope();
                corbelDriver.iam.scope().create(compositeScope)
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            after(function(done){
                corbelDriver.iam.scope(compositeScope.id).remove()
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            it('a composite scope can be read', function(done){
                corbelDriver.iam.scope(compositeScope.id).get()
                    .should.be.eventually.fulfilled
                    .then(function (response){
                        expect(response).to.have.deep.property('data.id', compositeScope.id);
                        expect(response).to.have.deep.property('data.type', compositeScope.type);
                        expect(response).to.have.deep.property('data.scopes.length', compositeScope.scopes.length);
                        expect(response.data.scopes).to.include.members(compositeScope.scopes);
                    })
                    .should.notify(done);
            });
        });

        describe('while testing composite scope updating', function() {
            before(function(done){
                compositeScope = corbelTest.common.iam.getCompositeScope();
                corbelDriver.iam.scope().create(compositeScope)
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            after(function(done){
                corbelDriver.iam.scope(compositeScope.id).remove()
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            it('a composite scope can be updated', function (done) {
                compositeScope.rules.push({test : 'testRule'});

                corbelDriver.iam.scope().create(compositeScope)
                    .should.be.eventually.fulfilled
                    .then(function (id){
                        expect(id).to.equal(compositeScope.id);

                        return corbelDriver.iam.scope(id).get()
                                .should.be.eventually.fulfilled;
                    }).then(function(response){
                        expect(response).to.have.deep.property('data.id', compositeScope.id);
                        expect(compositeScope.rules).to.contains({test : 'testRule'});
                    })
                    .should.notify(done);
            });
        });

        describe('while testing composite scope deletion', function () {

            before(function(done){
                compositeScope = corbelTest.common.iam.getCompositeScope();
                corbelDriver.iam.scope().create(compositeScope)
                    .should.be.eventually.fulfilled.and.notify(done);
            });

            it('a composite scope can be removed', function(done) {
                corbelDriver.iam.scope(compositeScope.id).remove()
                    .should.be.eventually.fulfilled
                    .then(function(){
                        return corbelDriver.iam.scope(compositeScope.id).get()
                            .should.be.eventually.reject;
                    }).then(function(err){
                        expect(err).to.be.equal();
                    })
                    .should.notify(done);
            });
        });
    });
});
