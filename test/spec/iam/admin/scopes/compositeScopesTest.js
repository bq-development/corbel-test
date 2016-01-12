describe('In IAM module', function() {

    describe('when performing composite scopes CRUD operations', function() {
        var corbelDriver;

        before(function() {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('a composite scope can be created', function(done) {
            var compositeScopeProps = corbelTest.common.iam.getCompositeScope();

            corbelDriver.iam.scope().create(compositeScopeProps)
                .should.be.eventually.fulfilled
                .then(function (id){
                    return corbelDriver.iam.scope(id)
                            .remove()
                            .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('a composite scope can be readed', function(done) {
            var compositeScopeProps = corbelTest.common.iam.getCompositeScope();

            corbelDriver.iam.scope()
                .create(compositeScopeProps)
                .should.be.eventually.fulfilled
                .then(function (id){
                    return corbelDriver.iam.scope(id)
                            .get()
                            .should.be.eventually.fulfilled;
                }).then(function (response){
                    expect(compositeScopeProps.id).to.equal(response.data.id);

                    return corbelDriver.iam.scope(response.data.id)
                            .remove()
                            .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('a composite scope can be updated', function(done) {
            var compositeScopeProps = corbelTest.common.iam.getCompositeScope();

            corbelDriver.iam.scope()
                .create(compositeScopeProps)
                .should.be.eventually.fulfilled
                .then(function (id){
                    return corbelDriver.iam.scope(id)
                            .get()
                            .should.be.eventually.fulfilled;
                }).then(function (response){
                    expect(compositeScopeProps.id).to.equal(response.data.id);
                    compositeScopeProps.rules.push({test : 'testRule'});

                    return corbelDriver.iam.scope()
                            .create(compositeScopeProps)
                            .should.be.eventually.fulfilled;
                }).then(function (id){
                    return corbelDriver.iam.scope(id)
                            .get()
                            .should.be.eventually.fulfilled;
                }).then(function(response){
                    expect(compositeScopeProps.rules).to.contains({test : 'testRule'});

                    return corbelDriver.iam.scope(response.data.id)
                            .remove()
                            .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });

        it('a composite scope can be removed', function(done) {
            var compositeScopeProps = corbelTest.common.iam.getCompositeScope();

            corbelDriver.iam.scope()
                .create(compositeScopeProps)
                .should.be.eventually.fulfilled
                .then(function (id){
                    return corbelDriver.iam.scope(id)
                            .remove()
                            .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});
