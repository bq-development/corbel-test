describe('In RESOURCES module', function() {

    describe('In RESTOR module, while testing CRUD operations', function() {
        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        // get Typed Arrays must be implemented in corbel-js
        it.skip('should make a complet flow for a file in RESTOR in octet-stream sending a uint8 array',
                function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My binary fileee!!! ññáaäéó' + Date.now();
            var ui8arr = new Uint8Array(FILE_CONTENT.length);
            for(var i = 0; i < FILE_CONTENT.length; i++){
              ui8arr[i] = FILE_CONTENT.charCodeAt(i);
            }

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(ui8arr, {dataType: 'application/octet-stream'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/octet-stream'})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', FILE_CONTENT);

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: 'application/octet-stream'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/octet-stream'})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        // get Typed Arrays must be implemented in corbel-js
        it.skip('should make a complet flow for a file in RESTOR in blob sending a uint8 array',
                function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My binary fileee!!! ññáaäéó' + Date.now();
            var ui8arr = new Uint8Array(FILE_CONTENT.length);
            for(var i = 0; i < FILE_CONTENT.length; i++){
              ui8arr[i] = FILE_CONTENT.charCodeAt(i);
            }

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(ui8arr, {dataType: 'application/blob'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/blob'})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', FILE_CONTENT);

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: 'application/blob'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/blob'})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('should make a complet flow for a file in RESTOR in octet-stream sending a binary array', function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My binary fileee!!! ññáaäéó' + Date.now();
            var BYTE_CONTENT = [];
            for(var i = 0; i < FILE_CONTENT.length; i++){
              BYTE_CONTENT.push(FILE_CONTENT.charCodeAt(i));
            }

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(BYTE_CONTENT, {dataType: 'application/octet-stream'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/octet-stream'})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', BYTE_CONTENT.toString());

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: 'application/octet-stream'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/octet-stream'})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('should make a complet flow for a file in RESTOR in octet-stream sending a string', function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My string fileee!!! ññáaäéó' + Date.now();

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(FILE_CONTENT, {dataType: 'application/octet-stream'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/octet-stream'})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', FILE_CONTENT);

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: 'application/octet-stream'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/octet-stream'})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('should make a complet flow for a file in RESTOR in blob sending a binary array', function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My binary fileee!!! ññáaäéó' + Date.now();
            var BYTE_CONTENT = [];
            for(var i = 0; i < FILE_CONTENT.length; i++){
              BYTE_CONTENT.push(FILE_CONTENT.charCodeAt(i));
            }

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(BYTE_CONTENT, {dataType: 'application/blob'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/blob'})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', BYTE_CONTENT.toString());

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: 'application/blob'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/blob'})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('should make a complet flow for a file in RESTOR in blob sending a string', function(done) {
            var FILENAME = 'RestorFileName' + Date.now();
            var FILE_CONTENT = 'this Is My string fileee!!! ññáaäéó' + Date.now();

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(FILE_CONTENT, {dataType: 'application/blob'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/blob'})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', FILE_CONTENT);

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: 'application/blob'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/blob'})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('should make a complete flow for a file in RESTOR in XML', function(done) {
            var FILENAME = 'RestorXMLName' + Date.now();
            var XML_CONTENT = '<test><date>' + Date.now() + '</date></test>';

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
            .update(XML_CONTENT, {dataType: 'application/xml'})
            .should.be.eventually.fulfilled
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/xml'})
                .should.be.eventually.fulfilled;
            })
            .then(function(resource) {
                expect(resource).to.have.property('data', XML_CONTENT);

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .delete({dataType: 'application/xml'})
                .should.be.eventually.fulfilled;
            })
            .then(function() {
                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME)
                .get({dataType: 'application/xml'})
                .should.be.eventually.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
