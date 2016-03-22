describe('In IAM module, with a domain, basic authentication capability can be configured', function() {
    var corbelDefaultDriver;
    var corbelDriverRoot;
    var domain = {
        id: 'domainId-' + Date.now(),
        description: 'New domain',
        scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete'],
        defaultScopes: ['iam:user:me']
    };

    var client = {
        name: 'client1',
        signatureAlgorithm: 'HS256',
        scopes: ['iam:user:me', 'iam:user:create', 'iam:user:delete']
    };

    var userData = {
        email: 'myEmail' + Date.now() + '@funkifake.com',
        username: 'new user' + Date.now(),
        password: 'password',
        scopes: undefined
    };

    before(function(done) {

        corbelDriverRoot = corbelTest.drivers['ROOT_CLIENT'].clone();

        corbelDriverRoot.iam.domain().create(domain)
            .should.be.eventually.fulfilled
            .then(function(id) {
                domain.id = id;
                return corbelDriverRoot.domain(domain.id).iam.client()
                    .create(client)
                    .should.be.eventually.fulfilled;
            }).then(function(id) {
                client.id = id;
                return corbelDriverRoot.domain(domain.id).iam.client(client.id)
                    .get()
                    .should.be.eventually.fulfilled;
            }).then(function(response) {
                client = response.data;
                client.clientSecret = client.key;
                corbelDefaultDriver = corbelTest.getCustomDriver({
                    'clientId': client.id,
                    'clientSecret': client.key,
                    'scopes': client.scopes.join(' ')
                });

                return corbelDefaultDriver.iam.token()
                    .create()
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDefaultDriver.iam.users()
                    .create(userData)
                    .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                userData.id = id;
            })
            .should.notify(done);
    });

    after(function(done) {
        corbelDefaultDriver.iam.user(userData.id)
            .delete()
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriverRoot.domain(domain.id).iam.client(client.id)
                    .remove()
                    .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriverRoot.domain(domain.id).iam.domain()
                    .remove()
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
    });

    it('with default configuration, user basic is logged successfully', function(done) {
        corbelDriverRoot.domain(domain.id).iam.domain()
            .update({
                capabilities: {}
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.clients
                    .loginUser(corbelDefaultDriver, userData.username, userData.password)
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
    });

    it('with enabled configuration, user basic is logged successfully', function(done) {
        corbelDriverRoot.domain(domain.id).iam.domain()
            .update({
                capabilities: {
                    basic: true
                }
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.clients
                    .loginUser(corbelDefaultDriver, userData.username, userData.password)
                    .should.be.eventually.fulfilled;
            })
            .should.notify(done);
    });

    it('with disabled configuration, user basic login is not allowed', function(done) {
        corbelDriverRoot.domain(domain.id).iam.domain()
            .update({
                capabilities: {
                    basic: false
                }
            })
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelTest.common.clients
                    .loginUser(corbelDefaultDriver, userData.username, userData.password)
                    .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'unauthorized');
            })
            .should.notify(done);
    });
});
