describe('In IAM module', function() {

    describe('for scope management', function() {
        var corbelRootDriver;
        var corbelDefaultDriver;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        it('when create a composite scope with simple scope, and update them, logged user have new scopes',
            function(done) {
                var compositeScope = {
                    id: 'TestCompositeScope',
                    type: 'composite_scope',
                    audience: 'empty',
                    rules: [{}]
                };

                var testScope = {
                    id: 'TestSimpleScope',
                    audience: 'http://iam.bqws.io',
                    rules: [{
                        mediaTypes: [
                            'application/json'
                        ],
                        methods: [
                            'GET'
                        ],
                        type: 'http_access',
                        uri: 'user/.*'
                    }]
                };

                var userData = {
                    email: 'myEmail' + Date.now() + '@funkifake.com',
                    username: 'new user' + Date.now(),
                    password: 'password',
                    scopes: [compositeScope.id]
                };

                var domain = {
                    id: 'newApp_' + Date.now(),
                    description: 'My new app',
                    scopes: ['iam:comp:base', testScope.id],
                    defaultScopes: ['iam:comp:base', testScope.id]
                };

                var client = {
                    name: 'client1',
                    signatureAlgorithm: 'HS256',
                    scopes: ['iam:comp:base', compositeScope.id]
                };

                corbelRootDriver.iam.scope()
                    .create(compositeScope)
                    .should.be.eventually.fulfilled
                    .then(function() {
                        return corbelRootDriver.iam.scope()
                            .create(testScope)
                            .should.be.eventually.fulfilled;
                    }).then(function() {
                        return corbelRootDriver.iam.domain()
                            .create(domain)
                            .should.be.eventually.fulfilled;
                    }).then(function(id) {
                        domain.id = id;

                        return corbelRootDriver.iam.client(domain.id)
                            .create(client)
                            .should.be.eventually.fulfilled;
                    }).then(function(id) {
                        client.id = id;

                        return corbelRootDriver.iam.client(domain.id, client.id)
                            .get()
                            .should.be.eventually.fulfilled;
                    }).then(function(response) {
                        client = response.data;

                        corbelDefaultDriver = corbel.getDriver({
                            'clientId': client.id,
                            'clientSecret': client.key,
                            'urlBase': corbelTest.CONFIG.COMMON.urlBase,
                            'scopes': client.scopes.join(' ')
                        });

                        return corbelDefaultDriver.iam.token().create();
                    }).then(function(response) {

                        return corbelDefaultDriver.iam.users()
                            .create(userData)
                            .should.be.eventually.fulfilled;
                    }).then(function(id) {
                        userData.id = id;

                        return corbelTest.common.clients
                            .loginUser(corbelDefaultDriver, userData.username, userData.password)
                            .should.be.eventually.fulfilled;

                    }).then(function() {
                        return corbelDefaultDriver.iam.user(userData.id)
                            .get()
                            .should.eventually.be.rejected;
                    }).then(function() {
                        compositeScope.scopes = [testScope.id];

                        // This is the same as update
                        return corbelRootDriver.iam.scope()
                            .create(compositeScope)
                            .should.be.eventually.fulfilled;
                    }).then(function() {
                        return corbelDefaultDriver.iam.user('me')
                            .disconnect()
                            .should.be.eventually.fulfilled;
                    }).then(function() {
                        return corbelTest.common.clients
                            .loginUser(corbelDefaultDriver, userData.username, userData.password)
                            .should.be.eventually.fulfilled;
                    }).then(function() {
                        return corbelDefaultDriver.iam.user(userData.id)
                            .get()
                            .should.be.eventually.fulfilled;
                    }).then(function() {
                        testScope.audience = 'badAudience';

                        return corbelRootDriver.iam.scope()
                            .create(testScope)
                            .should.be.eventually.fulfilled;
                    }).then(function() {
                        return corbelDefaultDriver.iam.user('me')
                            .disconnect()
                            .should.be.eventually.fulfilled;

                    }).then(function() {
                        return corbelTest.common.clients
                            .loginUser(corbelDefaultDriver, userData.username, userData.password)
                            .should.be.eventually.fulfilled;
                    }).then(function() {
                        return corbelDefaultDriver.iam.user(userData.id)
                            .get()
                            .should.eventually.be.rejected;
                    })
                    .should.notify(done);
            });
    });
});
