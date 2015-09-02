/* global $, q*/
describe('In RESOURCES module', function() {
    describe('In RESTOR module, while using REM-IMAGEs plugin', function() {

        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];
        });

        describe('When performing CRUD operations', function() {
            if (window.chrome) {
                var TEST_IMAGE = 
                    'Qk2eAAAAAAAAAHoAAABsAAAAAwAAAAMAAAABABgAAAAAACQAAAATCwAAEwsAAAAAAAAAAAAAQkdScwAAAAAAAA'+
                    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAD//wD/AP//'+
                    'AAAAAABmZmYA/wAAAH8AAAAAAP9/AAAA//8AAAA=';
                var TEST_IMAGE_SIZE = 158;
                var FILENAME;
                var queryValueFile;
                var queryValueMethod;

                beforeEach(function(done) {
                    FILENAME = 'TestImage_1_' + Date.now();

                    queryValueMethod = '{}&resource:encoding=base64&resource:length=';
                    queryValueFile = 
                        queryValueMethod + ((TEST_IMAGE.length * 3 / 4) - TEST_IMAGE.split('=').length + 1);

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'}).
                    should.be.eventually.rejected.
                    should.notify(done);
                });

                it('Image is correctly uploaded', function(done) {

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                        TEST_IMAGE, 
                        {
                            dataType: 'image/png',
                        }
                    ).
                    should.be.eventually.fulfilled.
                    then(function(){
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'}).
                        should.be.eventually.fulfilled;
                    }).
                    should.notify(done);
                });

                it('Image cannot be uploaded without dataType param', function(done) {

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(TEST_IMAGE).
                    should.be.eventually.rejected.
                    should.notify(done);
                });

                it('Image is correctly retrieved', function(done) {

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                        TEST_IMAGE, 
                        {
                            dataType: 'image/png',
                        }
                    ).
                    should.be.eventually.fulfilled.
                    then(function(){
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'}).
                        should.be.eventually.fulfilled;
                    }).
                    then(function(resource){
                        expect(resource.data).to.be.equal(TEST_IMAGE);
                    }).
                    should.notify(done);
                });

                it('Image cannot be retrieved without dataType param', function(done) {
                    var TEST_IMAGE_2 = 
                        'R0lGODlhAwADAPMAAP8AAAAAf///AGZmZgD/AH8AAAD///8A/wAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
                        'CH5BAAAAAAAIf8LSW1hZ2VNYWdpY2sHZ2FtbWE9MAAsAAAAAAMAAwAABAcQBDFIMQdFADs=';

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                        TEST_IMAGE, 
                        {
                            dataType: 'image/png',
                        }
                    ).
                    then(function() {
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get().
                        should.be.eventually.rejected;
                    }).
                    then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    }).
                    should.notify(done);
                });

                it('Image is correctly updated', function(done) {
                    var TEST_IMAGE_2 = 
                        'R0lGODlhAwADAPMAAP8AAAAAf///AGZmZgD/AH8AAAD///8A/wAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
                        'CH5BAAAAAAAIf8LSW1hZ2VNYWdpY2sHZ2FtbWE9MAAsAAAAAAMAAwAABAcQBDFIMQdFADs=';

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                        TEST_IMAGE, 
                        {
                            dataType: 'image/png',
                        }
                    ).
                    should.be.eventually.fulfilled.
                    then(function(){
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'}).
                        should.be.eventually.fulfilled;
                    }).
                    then(function(resource) {
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                            TEST_IMAGE_2, 
                            {
                                dataType: 'image/png',
                            }
                        ).
                        should.be.eventually.fulfilled;
                    }).
                    then(function(){
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'}).
                        should.be.eventually.fulfilled;
                    }).
                    then(function(resource){
                        expect(resource.data).not.to.be.equal(TEST_IMAGE);
                        expect(resource.data).to.be.equal(TEST_IMAGE_2);
                    }).
                    should.notify(done);
                });

                it('Image is correctly delected', function(done) {
                    var TEST_IMAGE_2 = 
                        'R0lGODlhAwADAPMAAP8AAAAAf///AGZmZgD/AH8AAAD///8A/wAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
                        'CH5BAAAAAAAIf8LSW1hZ2VNYWdpY2sHZ2FtbWE9MAAsAAAAAAMAAwAABAcQBDFIMQdFADs=';

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                        TEST_IMAGE, 
                        {
                            dataType: 'image/png',
                        }
                    ).
                    should.be.eventually.fulfilled.
                    then(function(){
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).delete({dataType:'image/png'}).
                        should.be.eventually.fulfilled;
                    }).
                    then(function() {
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'}).
                        should.be.eventually.rejected;
                    }).
                    then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    }).
                    should.notify(done);
                });

                afterEach(function(done) {
                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).delete({ dataType: 'image/png' }).
                    should.be.eventually.fulfilled.
                    then(function() {
                        return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'}).
                        should.be.eventually.rejected;
                    }).
                    then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    }).
                    should.notify(done);
                });
            }
        });
    });
});