describe('In RESOURCES module', function() {

    describe('In RESMI module, testing getRelationLink ', function() {

        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CoreJSObjectLinkA' + TIMESTAMP;
        var COLLECTION_B = 'test:CoreJSObjectLinkB' + TIMESTAMP;
        var TEST_OBJECT = {
            test: 'test'
        };
        var idResourceA = 0;
        var idResourceB = 0;

        before(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];

            corbelDriver.resources.collection(COLLECTION_A)
            .add(TEST_OBJECT)
            .should.eventually.be.fulfilled
            .then(function(id) {
                idResourceA = id;
                return corbelDriver.resources.collection(COLLECTION_B)
                .add(TEST_OBJECT)
                .should.eventually.be.fulfilled;
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
                .should.eventually.be.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });


        it(' when requests to create a relation, the system creates automatic links', function(done) {
            corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
            .add(idResourceB)
            .should.eventually.be.fulfilled
            .then(function() {
                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .get()
                .should.eventually.be.fulfilled;
            })
            .then(function(response) {
                var relation = response.data[0];
                var link = relation.links[0];
                var urlBase = corbelDriver.config.get('urlBase').replace('{{module}}', 'resources');

                expect(link.href).to.be.equal(urlBase + 'resource/' + COLLECTION_B + '/' + idResourceB);
                expect(link.rel).to.be.equal('self');

                return corbelDriver.resources.relation(COLLECTION_A, idResourceA, COLLECTION_B)
                .delete()
                .should.be.eventually.fulfilled;
            })
            .should.eventually.be.fulfilled.notify(done);
        });
    });
});
