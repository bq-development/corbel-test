describe('In IAM module', function() {

    describe('for scope management', function() {
        var corbelRootDriver;

        before(function() {
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

// cambiar título
        it('when create a composite scope with simple scope, and update them,' +
               ' login gets new scopes', function(done) {
            var compositeScope = {
                id: 'TestCompositeScope_' + Date.now(),
                type: 'composite_scope',
                audience: 'empty',
                rules: [{}]
            };

            var testScope = {
                id: 'TestSimpleScope_' + Date.now(),
                audience: 'http://iam.bqws.io',
                rules: [{
                    mediaTypes: [
                        'application/json'
                    ],
                    methods: [
                        'GET'
                    ],
                    type: 'http_access',
                    uri: 'v.*/user/.*'
                }]
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
                scopes: ['iam:comp:base']
            };

            var userData;
            var temporalDriver;

            corbelRootDriver.iam.scope()
            .create(compositeScope)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.scope()
                .create(testScope)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelRootDriver.iam.domain()
                .create(domain)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                domain.id= id;
                
                return corbelRootDriver.iam.client(domain.id)
                .create(client)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                client.id = id;
                client.scopes.push(compositeScope.id);

                temporalDriver = corbel.getDriver({
                   'clientId': client.id,
                    'clientSecret': client.key,
                    'urlBase': corbelTest.CONFIG.COMMON.urlBase,
                    'scopes': client.scopes.join(' ')
                });
                //falla
                return corbelTest.common.clients.loginAsRandomUser(temporalDriver)
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                userData = response.user;

                return temporalDriver.iam.user(userData.data.id)
                .get()
                .should.eventually.be.rejected;
            })
            .then(function() {
                compositeScope.scopes = [testScope.id];

                return corbelRootDriver.iam.scope()
                .create(compositeScope)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return temporalDriver.iam.user(userData.data.id)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                testScope.audience = 'badAudience';

                return corbelRootDriver.iam.scope()
                .create(testScope)
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return temporalDriver.iam.user(userData.id)
                .get()
                .should.eventually.be.rejected;
            })
            .should.notify(done);
        });
    });
});
