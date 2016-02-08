describe('In RESOURCES module, while using public public resources', function() {
    var corbelRootDriver;
    var corbelDriver;

    var domainId;
    var FOLDER_NAME = 'test:Restor';
    var random;
    var currentResourcesEndpoint;
    var FILENAME;
    var TEST_IMAGE_SIZE = 158;
    var TEST_IMAGE = 'R0lGODlhAwADAPMAAP8AAAAAf///AGZmZgD/AH8AAAD///8A/wAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'CH5BAAAAAAAIf8LSW1hZ2VNYWdpY2sHZ2FtbWE9MAAsAAAAAAMAAwAABAcQBDFIMQdFADs=';

    describe('when retrieving a public image', function(){
        before(function(done) {
            var domain;
            random = Date.now();
            
            FILENAME = 'TestImage_1_' + random;

            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();

            currentResourcesEndpoint = corbelRootDriver.config.getCurrentEndpoint('resources');

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

            corbelRootDriver.iam.scope().create(publicScope)
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelRootDriver.iam.domain().create(domain)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                domainId = id;
                return corbelRootDriver.iam.client(domainId).create(client)
                .should.be.eventually.fulfilled;
            })
            .then(function(clientId) {
                return corbelRootDriver.iam.client(domainId, clientId).get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                var createdClient = response.data;
                var confCreatedClient = corbelTest.getConfig();
                confCreatedClient.clientId = createdClient.id;
                confCreatedClient.clientSecret = createdClient.key;
                confCreatedClient.scopes = createdClient.scopes.join(' ');
                corbelDriver = corbelTest.getCustomDriver(confCreatedClient);

                return corbelDriver.iam.token().create()
                .should.be.eventually.fulfilled;
            })
            .then(function(){
                return corbel.request.send({
                    url: currentResourcesEndpoint + domainId + '/resource/' +
                        FOLDER_NAME + '/' + FILENAME,
                    method: corbel.request.method.PUT,
                    headers: {
                        'Accept': 'image/png'
                    },
                    data: TEST_IMAGE,
                })
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(FOLDER_NAME, FILENAME).delete()
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('the image can be retrieved successfully', function(done) {

            corbel.request.send({
                url: currentResourcesEndpoint + domainId + '/resource/' +
                    FOLDER_NAME + '/' + FILENAME,
                method: corbel.request.method.GET,
                headers: {
                    'Accept': 'image/png'
                },
                contentType: 'image/png'
            })
            .should.be.eventually.fulfilled
            .then(function(response) {
                expect(response).to.have.deep.property('data', TEST_IMAGE);
            })
            .should.notify(done);
        });
    });
});
