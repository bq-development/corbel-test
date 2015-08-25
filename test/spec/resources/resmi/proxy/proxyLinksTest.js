describe('In RESOURCES module ', function() {

    describe('In RESMI module, testing proxyLinks ', function() {
        var corbelDriver;
        var urlBaseBackup;
        var COLLECTION_NAME = 'test:CorbelJSProxyTest';
        var TEST_OBJECT = {
            a: 1
        };

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
            urlBaseBackup = corbelDriver.config.config.urlBase.replace('{{module}}', 'resources');
            corbelDriver.config.config.urlBase =
                corbelDriver.config.get('urlBase').replace('bqws.io/', 'bqws.io/resources/')
                .replace('{{module}}', 'proxy');
        });

        after(function() {
            corbelDriver.config.config.urlBase = urlBaseBackup;
        });

        it.skip(' when creates a resource, location includes full path', function(done) {
            var objectId;

            corbelDriver.resources.collection(COLLECTION_NAME)
            .add(TEST_OBJECT)
            .should.eventually.be.fulfilled
            .then(function(id) {
                objectId = id;

                return corbelDriver.resources.resource(COLLECTION_NAME, objectId)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(content) {
                expect(content.data.links[0].href)
                    .to.be.equal(corbelDriver.config.config.urlBase +
                        'resource/' + COLLECTION_NAME + '/' + objectId);
            })
            .should.eventually.be.fulfilled.notify(done);
        });
    });
});
