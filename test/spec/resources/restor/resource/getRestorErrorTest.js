describe('In RESOURCES module', function() {
    describe('In RESTOR module, when testing getRestorError', function() {
        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';
        var FILENAME = 'RestorFileName' + Date.now();

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        it('should fail returning error NOT FOUND(404) when you get file RESTOR that not exist',
        function(done) {
            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .get({dataType:'application/octet-stream'})
            .should.be.eventually.rejected.
            then(function(e) {
                expect(e).to.have.property('status', 404);
            }).
            should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
