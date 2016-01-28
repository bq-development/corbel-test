describe('In RESOURCES module', function() {

    describe('In RESTOR module, while testing CRUD operations', function() {
        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';
        var FILENAME;

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            FILENAME = 'RestorFileName' + Date.now();
        });

        var makeFlow = function(data, type) {
            return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(data, {dataType: type})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: type})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', data.toString());

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: type})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: type})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            });
        };

        it('should make an entire flow for a file in RESTOR in octet-stream sending a binary array', 
                function(done) {
            var FILE_CONTENT = 'this Is My binary fileee!!! ññáaäéó' + Date.now();
            var BYTE_CONTENT = [];
            for(var i = 0; i < FILE_CONTENT.length; i++){
              BYTE_CONTENT.push(FILE_CONTENT.charCodeAt(i));
            }

            makeFlow(BYTE_CONTENT, 'application/octet-stream')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should make an entire flow for a file in RESTOR in octet-stream sending a string', function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My string fileee!!! ññáaäéó' + Date.now();

            makeFlow(FILE_CONTENT, 'application/octet-stream')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should make an entire flow for a file in RESTOR in blob sending a binary array', function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My binary fileee!!! ññáaäéó' + Date.now();
            var BYTE_CONTENT = [];
            for(var i = 0; i < FILE_CONTENT.length; i++){
              BYTE_CONTENT.push(FILE_CONTENT.charCodeAt(i));
            }

            makeFlow(BYTE_CONTENT, 'application/blob')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should make an entire flow for a file in RESTOR in blob sending a string', function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My string fileee!!! ññáaäéó' + Date.now();

            makeFlow(FILE_CONTENT, 'application/blob')
            .should.be.eventually.fulfilled.and.notify(done);
        });

        it('should make an entire flow for a file in RESTOR in XML', function(done) {
            var FILENAME = 'RestorXMLName' + Date.now();
            var XML_CONTENT = '<test><date>' + Date.now() + '</date></test>';

            makeFlow(XML_CONTENT, 'application/xml')
            .should.be.eventually.fulfilled.and.notify(done);
        });
    });
});
