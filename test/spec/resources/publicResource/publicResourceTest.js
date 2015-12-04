describe('In RESOURCES module', function() {
    var corbelRootDriver;
    var corbelTestDriver;

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('if a resource is public', function(done) {
        var domain;
        var domainId;
        var publicResourceTestCollection = 'test:PublicResource';
        var idResource;
        var confCreatedClient;

        before(function(done) {
            var scopeId = 'scopeId-' + Date.now();
            var audience = 'http://resources.bqws.io';
            var rules = [{
                mediaTypes: ['application/json'],
                methods: ['GET'],
                type: 'http_access',
                uri: 'resource/' + publicResourceTestCollection + '(/.*)?' 
            }];

            var publicScope = {
                id: scopeId,
                audience: audience ,
                rules: rules
            };

            var publicScopes = [scopeId];
            var scopes = ['silkroad-qa:resources', scopeId];

            domain = corbelTest.common.iam.getDomain(undefined, undefined, undefined, scopes, publicScopes);
          
            corbelRootDriver.iam.scope()
            .create(publicScope)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.domain()
                .create(domain) 
                .should.be.eventually.fulfilled;   
            })
            .then(function(id) {
                domainId = id;

                var client = {
                    name: 'testClient_' + Date.now(),
                    signatureAlgorithm: 'HS256',
                    domain: domainId,
                    scopes: ['silkroad-qa:resources']
                };

                return corbelRootDriver.iam.client(domainId)
                    .create(client)
                    .should.be.eventually.fulfilled;
            })
            .then(function(clientId) {
                return corbelRootDriver.iam.client(domainId, clientId)
                    .get()
                    .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                var createdClient = response.data;
                confCreatedClient = corbelTest.getConfig();
                confCreatedClient.clientId = createdClient.id;
                confCreatedClient.clientSecret = createdClient.key;
                confCreatedClient.scopes = createdClient.scopes.join(' ');
                corbelTestDriver = corbel.getDriver(confCreatedClient);

                return corbelTestDriver.iam.token().create();
            })
            .then(function() {
                var testResource = {
                    testField : 'testContent'
                };

                return corbelTestDriver.resources.collection(publicResourceTestCollection)
                .add(testResource)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                idResource = id;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelTestDriver.resources.resource(publicResourceTestCollection, idResource)
            .delete()
            .should.be.eventually.fulfilled.and.should.notify(done);
        });

        it('that can be consulted without token.', function(done) {
            var currentResourcesEndpoint = confCreatedClient.localServices.indexOf('resources') !== -1 ? 
            confCreatedClient.resourcesEndpoint : confCreatedClient.urlBase.replace('{{module}}', 'resources');

            corbel.request.send({
                url: currentResourcesEndpoint + domainId + '/resource/' + 
                    publicResourceTestCollection + '/' +idResource,
                method: corbel.request.method.GET,
                headers: {
                    'Accept': 'application/json'
                }

            })
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', idResource);
            })
            .should.notify(done);
        });
    });
});