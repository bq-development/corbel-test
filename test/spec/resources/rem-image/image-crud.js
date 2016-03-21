/* global $, q*/
describe('In RESOURCES module', function() {
    describe('while using REM-IMAGEs plugin', function() {

        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        describe('when performing CRUD operations', function() {
            if (window.chrome) {
                var TEST_IMAGE = 
                    'Qk2eAAAAAAAAAHoAAABsAAAAAwAAAAMAAAABABgAAAAAACQAAAATCwAAEwsAAAAAAAAAAAAAQkdScwAAAAAAAA'+
                    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAD//wD/AP//'+
                    'AAAAAABmZmYA/wAAAH8AAAAAAP9/AAAA//8AAAA=';
                var TEST_IMAGE_SIZE = 158;
                var FILENAME;

                beforeEach(function(done) {
                    FILENAME = 'TestImage_1_' + Date.now();

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({dataType:'image/png'})
                    .should.be.eventually.rejected
                    .should.notify(done);
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

                it('image is correctly uploaded', function(done) {

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

                it('image cannot be uploaded without dataType param', function(done) {

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(TEST_IMAGE)
                    .should.be.eventually.rejected
                    .then(function(e) {
                        expect(e).to.have.property('status', 422);
                        expect(e).to.have.deep.property('data.error', 'invalid_entity');
                    })
                    .should.notify(done);
                });

                it('image is correctly retrieved', function(done) {

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
                        expect(resource).to.have.property('data', TEST_IMAGE);
                    }).
                    should.notify(done);
                });

                it('image cannot be retrieved without dataType param', function(done) {
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

                it('image is correctly updated', function(done) {
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
                        expect(resource).to.have.property('data').and.not.equal(TEST_IMAGE);
                        expect(resource).to.have.property('data', TEST_IMAGE_2);
                    }).
                    should.notify(done);
                });

                it('image is correctly delected', function(done) {
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
            }
        });
    });
});
