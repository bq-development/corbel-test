describe('In RESOURCES module, a public image', function() {
    var corbelRootDriver;
    var corbelDriver;

    var domainId;
    var FOLDER_NAME = 'test:Restor';
    var random;
    var currentResourcesEndpoint;
    var FILENAME;

    beforeEach(function(done) {
        var domain;
        random = Date.now();

        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();

        currentResourcesEndpoint = corbelTest.CONFIG.COMMON.urlBase.replace('{{module}}', corbel.Resources.moduleName);

        var scopeId = 'scopeId-' + random;
        var audience = 'http://resources.bqws.io';
        var rules = [{
            mediaTypes: ['image/png', 'application/json'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            type: 'http_access',
            uri: 'resource/' + FOLDER_NAME + '(/.*)?'
        }];

        var publicScope = {
            id: scopeId,
            audience: audience,
            rules: rules
        };

        var client = {
            name: 'testClient_' + random,
            signatureAlgorithm: 'HS256',
            domain: domainId,
            scopes: ['silkroad-qa:resources']
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
                var confCreatedClient = corbelTest.getConfig();
                confCreatedClient.clientId = createdClient.id;
                confCreatedClient.clientSecret = createdClient.key;
                confCreatedClient.scopes = createdClient.scopes.join(' ');
                corbelDriver = corbel.getDriver(confCreatedClient);

                return corbelDriver.iam.token()
                    .create().should.be.eventually.fulfilled;
            })
            .then(function(response) {
                var accessToken = response.data.accessToken;
                FILENAME = 'TestImage_1_' + Date.now();

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                        dataType: 'image/png'
                    })
                    .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
    });

    afterEach(function(done) {
        corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .delete()
            .should.be.eventually.fulfilled.and.should.notify(done);
    });

    it('that can be consulted without token image is correctly uploaded', function(done) {
        if (window.chrome) {
            var TEST_IMAGE =
                'R0lGODlhAwADAPMAAP8AAAAAf///AGZmZgD/AH8AAAD///8A/wAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                'CH5BAAAAAAAIf8LSW1hZ2VNYWdpY2sHZ2FtbWE9MAAsAAAAAAMAAwAABAcQBDFIMQdFADs=';
            var TEST_IMAGE_SIZE = 158;

            corbel.request.send({
                    url: currentResourcesEndpoint + domainId + '/resource/' +
                        FOLDER_NAME + '/' + FILENAME,
                    method: corbel.request.method.PUT,
                    headers: {
                        'Accept': 'image/png'
                    },
                    data: TEST_IMAGE,
                })
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbel.request.send({
                            url: currentResourcesEndpoint + domainId + '/resource/' +
                                FOLDER_NAME + '/' + FILENAME,
                            method: corbel.request.method.GET,
                            headers: {
                                'Accept': 'image/png'
                            },
                            contentType: 'image/png'
                        })
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        }
    });
});
