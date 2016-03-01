describe('In RESOURCES module', function() {

    describe('In RESTOR module, while testing CRUD operations', function() {
        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';
        var FILENAME = 'RestorFileName' + Date.now();

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('an error [404] is returned when you add a file using POST instead of PUT', function(done) {
            corbelDriver.resources.collection(FOLDER_NAME).add(FILENAME, {dataType:'application/octet-stream'})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            }).
            should.notify(done);
        });

        it('an error [404] is returned when you try to retrieve a RESTOR file which does not exist', function(done) {
            corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'application/octet-stream'})
            .should.be.eventually.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
