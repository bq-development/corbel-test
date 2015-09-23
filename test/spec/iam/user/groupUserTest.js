describe('In IAM module', function() {

    describe('while testing user groups', function() {
        var corbelDriver;
        var userId;
        var random;
        var domainEmail = '@funkifake.com';

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            random = Date.now();

            corbelDriver.iam.user()
            .create({
                'firstName':'firstNameTest',
                'email': 'userTest' + random + domainEmail,
                'username':'userTest' + random + domainEmail
            })
            .should.eventually.be.fulfilled
            .then(function(id) {
                userId = id;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.iam.user(userId)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('a group is added to an user', function(done) {
            
            corbelDriver.iam.user(userId)
            .addGroups(['groupTest1'])
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest1');
            })
            .should.notify(done);
        });

        it('two groups are added to an user at the same time', function(done) {
            
            corbelDriver.iam.user(userId)
            .addGroups(['groupTest1', 'groupTest2'])
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest1');
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest2');
            })
            .should.notify(done);
        });

        it('two groups are added to an user at different times', function(done) {
            
            corbelDriver.iam.user(userId)
            .addGroups(['groupTest1'])
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .addGroups(['groupTest2'])
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest1');
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest2');
            })
            .should.notify(done);
        });

        it('a group is deleted for an user', function(done) {
            corbelDriver.iam.user(userId)
            .addGroups(['groupTest1'])
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest1');

                return corbelDriver.iam.user(userId)
                .deleteGroup(['groupTest1'])
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').not.to.contain('groupTest1');
            })
            .should.notify(done);
        });

        it('two groups are deleted for an user in different times', function(done) {
            corbelDriver.iam.user(userId)
            .addGroups(['groupTest1', 'groupTest2'])
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest1');
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest2');

                return corbelDriver.iam.user(userId)
                .deleteGroup(['groupTest1'])
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').not.to.contain('groupTest1');
                expect(response).to.have.deep.property('data.groups').to.contain('groupTest2');

                return corbelDriver.iam.user(userId)
                .deleteGroup(['groupTest2'])
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(userId)
                .get()
                .should.eventually.be.fulfilled;    
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.groups').not.to.contain('groupTest1');
                expect(response).to.have.deep.property('data.groups').not.to.contain('groupTest2');
            })
            .should.notify(done);
        });
    });
});
