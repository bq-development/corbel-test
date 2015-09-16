describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing relation\'s links', function() {

        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSObjectLinkA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSObjectLinkB' + TIMESTAMP;
        var TEST_OBJECT = {
            test: 'test'
        };
        var idResourceA = 0;
        var idResourceB = 0;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelDriver.resources.collection(COLLECTION_A)
            .add(TEST_OBJECT)
            .should.eventually.be.fulfilled
            .then(function(id) {
                idResourceA = id;
                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT)
                .should.be.eventually.fulfilled;
            })
            .then(function(id) {
                idResourceB = id;
            })
            .should.eventually.be.fulfilled.notify(done);
        });

        after(function(done) {
            corbelDriver.resources.resource(COLLECTION_A, idResourceA)
            .delete()
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(COLLECTION_B, idResourceB)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });


        it('relation links are automatically set up when a relation is created', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .add(idResourceB)
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .get()
                .should.be.eventually.fulfilled;
            })
            .then(function(response) {
                var relation = response.data[0];
                var link = relation.links[0];
                var urlBase = corbelDriver.config.get('urlBase').replace('{{module}}', 'resources');
                var expectedUrl = urlBase +corbelTest.CONFIG.DOMAIN+'/resource/' + COLLECTION_B + '/' + idResourceB;

                expect(link.href).to.be.equal(expectedUrl);
                expect(link).to.have.deep.property('rel', 'self');

                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });
    });
});
