describe('In RESOURCES module, In RESMI module,', function() {
    var COLLECTION_NAME_CRUD = 'test:corbelTestUserIdCollectionTest';
    var amount = 25;
    var drivers = [];

    before(function(done) {
        var corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        corbelTest.common.iam.createUsers(corbelDriver, amount)
            .should.be.eventually.fulfilled
            .then(function(users) {
                return users.map(function(user) {
                    var driver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
                    drivers.push(driver);
                    driver.userId = user.id;

                    return corbelTest.common.clients
                        .loginUser(driver, user.username, user.password)
                        .should.be.eventually.fulfilled;
                });
            }).then(function(promises) {
                return Promise.all(promises)
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
    });

    it('concurrent users add an object and the response location contains his user id', function(done) {
        var promises = drivers.map(function(driver) {
            return driver.resources.collection(COLLECTION_NAME_CRUD)
                .add({})
                .should.be.eventually.fulfilled
                .then(function(id) {
                    expect(id).to.contain(driver.userId);
                })
                .should.be.eventually.fulfilled;
        });

        Promise.all(promises)
            .should.be.eventually.fulfilled
            .and.notify(done);
    });

});
