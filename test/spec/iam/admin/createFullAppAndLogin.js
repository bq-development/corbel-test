describe('In IAM module', function() {

    describe('domain management allows create full appplication with', function() {
        var corbelRootDriver;
        var corbelDriver;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });


        it('a domain can be created and deleted', function(done) {
            var domain = {
                id: 'newApp_' + Date.now(),
                description: 'My new app',
                scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
                defaultScopes: ['iam:user:me']
            };

            corbelRootDriver.iam.domain()
            .create(domain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                domain.id = id;

                return corbelRootDriver.iam.domain(domain.id)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', domain.id);

                return corbelRootDriver.iam.domain(domain.id)
                .remove()
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.domain(domain.id)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('new client can be created and deleted', function(done) {
            var domain = {
                id: 'newApp_' + Date.now(),
                description: 'My new app',
                scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
                defaultScopes: ['iam:user:me']
            };

            var client = {
                name: 'client1',
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:delete']
            };

            corbelRootDriver.iam.domain()
            .create(domain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                domain.id = id;

                return corbelRootDriver.iam.client(domain.id)
                .create(client)
                .should.be.eventually.fulfilled;
            })
            .then(function(id){
                client.id = id;

                return corbelRootDriver.iam.client(domain.id, client.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                client.clientsecret = response.data.key;
                expect(response).to.have.deep.property('data.id', client.id);
            })
            .then(function(){
                return corbelRootDriver.iam.client(domain.id, client.id)
                .remove()
                .should.eventually.be.fulfilled;
            })
            .then(function(){
                return corbelRootDriver.iam.client(domain.id, client.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .then(function() {
                return corbelRootDriver.iam.domain(domain.id)
                .remove()
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.domain(domain.id)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('new user can be created, login and deleted', function(done) {
            var userData = {
                email: 'myEmail@funkifake.com',
                username: 'new user',
                password: 'password',
                scopes: undefined
            };

            var domain = {
                id: 'newApp_' + Date.now(),
                description: 'My new app',
                scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
                defaultScopes: ['iam:user:me']
            };

            var client = {
                name: 'client1',
                signatureAlgorithm: 'HS256',
                scopes: ['iam:user:create', 'iam:user:delete']
            };

            corbelRootDriver.iam.domain()
            .create(domain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                domain.id = id;

                return corbelRootDriver.iam.client(domain.id)
                .create(client)
                .should.be.eventually.fulfilled;
            })
            .then(function(id){
                client.id = id;
                return corbelRootDriver.iam.client(domain.id, client.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response){
                client.clientsecret = response.data.key;
                expect(response).to.have.deep.property('data.id', client.id);
            })
            .then(function(){
                return corbelTest.common.iam.createUsers(corbelRootDriver, 1) 
                .should.be.eventually.fulfilled;
            })
            .then(function(user){
                userData= user[0];

                return corbelTest.common.clients
                .loginUser(corbelDriver, userData.username, userData.password)
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelDriver.iam.user(userData.id)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.user(userData.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .then(function(){
                return corbelRootDriver.iam.client(domain.id, client.id)
                .remove()
                .should.eventually.be.fulfilled;
            })
            .then(function(){
                return corbelRootDriver.iam.client(domain.id, client.id)
                .get()
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .then(function() {
                return corbelRootDriver.iam.domain(domain.id)
                .remove()
                .should.eventually.be.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.domain(domain.id)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
