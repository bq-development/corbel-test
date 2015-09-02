describe('In RESOURCES module', function() {
	describe('In RESTOR module, while using REM-IMAGEs plugin', function() {

		var corbelDriver;
        var FOLDER_NAME = 'test:Restor';

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];
        });

        describe('When performing image:operations to base64 type images', function() {
            if (window.chrome) {
                var TEST_IMAGE = 
                    'Qk2eAAAAAAAAAHoAAABsAAAAAwAAAAMAAAABABgAAAAAACQAAAATCwAAEwsAAAAAAAAAAAAAQkdScwAAAAAAAA'+
                    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAD//wD/AP//'+
                    'AAAAAABmZmYA/wAAAH8AAAAAAP9/AAAA//8AAAA=';
                var TEST_IMAGE_SIZE = 158;
                var FILENAME;
                var queryValueFile;
                var queryValueMethod;

                var compareImages = function(image, expectedImageInBase64) {
                    var array = new Uint8Array(image);
                    var strImg = '';
                    for (var i = 0; i < array.length; i++) {
                        strImg += String.fromCharCode(array[i]);
                    }
                    expect(strImg).
                    to.be.equals(atob(expectedImageInBase64));
                };

                var getImageModified = function(operationQuery) {
                    return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get(
                        {
                            dataType:'image/bmp',
                            responseType: 'arraybuffer',
                            query: '{}&'+operationQuery
                        }
                    ).
                    should.be.eventually.fulfilled;
                };

                beforeEach(function(done) {
                    FILENAME = 'TestImage_1_' + Date.now();

                    queryValueMethod = '{}&resource:encoding=base64&resource:length=';
                    queryValueFile = 
                        queryValueMethod + ((TEST_IMAGE.length * 3 / 4) - TEST_IMAGE.split('=').length + 1);

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                        TEST_IMAGE, 
                        {
                            dataType:'image/bmp',
                            query: queryValueFile
                        }
                    ).
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

                it('Success changing image\'s format (bmp to gif)', function(done) {
                    var TEST_FORMAT = 
                        'R0lGODlhAwADAPMAAP8AAAAAf///AGZmZgD/AH8AAAD///8A/wAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAA'+
                        'CH5BAAAAAAAIf8LSW1hZ2VNYWdpY2sHZ2FtbWE9MAAsAAAAAAMAAwAABAcQBDFIMQdFADs=';

                    getImageModified('image:format=gif').
                    then(function(img) {
                        compareImages(img.data, TEST_FORMAT);
                    }).
                    should.notify(done);
                });

                it('crop', function(done) {
                    var TEST_CROP = 
                        'Qk2aAAAAAAAAAIoAAAB8AAAAAgAAAAIAAAABABgAAAAAABAAAAATCwAAEwsAAAAAAAAAAAAAAAD/AAD/A'+
                        'AD/AAAAAAAA/0JHUnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0M7Mvr0fhQz8KV4UAAAAAAAAAAAAAAA'+
                        'AEAAAAAAAAAAAAAAAAAAAAZmZmAP8AAAAAAP9/AAAAAA==';

                    getImageModified('image:operations=crop=(0,0,2,2)').
                    then(function(img) {
                        compareImages(img.data, TEST_CROP);
                    }).
                    should.notify(done);
                });

                it('resizeWidth', function(done) {
                    var TEST_RESIZE_WIDTH = 
                        'Qk2aAAAAAAAAAIoAAAB8AAAAAgAAAAIAAAABABgAAAAAABAAAAATCwAAEwsAAAAAAAAAAAAAAAD/AAD/A'+
                        'AD/AAAAAAAA/0JHUnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0M7Mvr0fhQz8KV4UAAAAAAAAAAAAAAA'+
                        'AEAAAAAAAAAAAAAAAAAAAAv7ZTox5bAAAsPHEQl3kAAA==';

                    getImageModified('image:operations=resizeWidth=2').
                    then(function(img) {
                        compareImages(img.data, TEST_RESIZE_WIDTH);
                    }).
                    should.notify(done);
                });

                it('resizeHeight', function(done) {
                    var TEST_RESIZE_HEIGHT = 
                        'Qk2aAAAAAAAAAIoAAAB8AAAAAgAAAAIAAAABABgAAAAAABAAAAATCwAAEwsAAAAAAAAAAAAAAAD/AAD/A'+
                        'AD/AAAAAAAA/0JHUnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0M7Mvr0fhQz8KV4UAAAAAAAAAAAAAAA'+
                        'AEAAAAAAAAAAAAAAAAAAAAv7ZTox5bAAAsPHEQl3kAAA==';

                    getImageModified('image:operations=resizeHeight=2').
                    then(function(img) {
                        compareImages(img.data, TEST_RESIZE_HEIGHT);
                    }).
                    should.notify(done);
                });

                it('resizeAndFill', function(done) {
                    var TEST_RESIZE_AND_FILL = 
                        'Qk2uAAAAAAAAAIoAAAB8AAAAAwAAAAMAAAABABgAAAAAACQAAAATCwAAEwsAAAAAAAAAAAAAAAD/AAD/A'+
                        'AD/AAAAAAAA/0JHUnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0M7Mvr0fhQz8KV4UAAAAAAAAAAAAAAA'+
                        'AEAAAAAAAAAAAAAAAAAAAA//8A/wD//wAAAAAAZmZmAP8AAAB/AAAAAAD/fwAAAP//AAAA';

                    getImageModified('image:operations=resizeAndFill=(3, 0000FF)').
                    then(function(img) {
                        compareImages(img.data, TEST_RESIZE_AND_FILL);
                    }).
                    should.notify(done);
                });

                it('cropFromCenter', function(done) {
                    var TEST_CROP_FROM_CENTER = 
                        'Qk2OAAAAAAAAAIoAAAB8AAAAAQAAAAEAAAABABgAAAAAAAQAAAATCwAAEwsAAAAAAAAAAAAAAAD/AAD/A'+
                        'AD/AAAAAAAA/0JHUnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0M7Mvr0fhQz8KV4UAAAAAAAAAAAAAAA'+
                        'AEAAAAAAAAAAAAAAAAAAAAAP8AAA==';

                    getImageModified('image:operations=cropFromCenter=(1, 1)').
                    then(function(img) {
                        compareImages(img.data, TEST_CROP_FROM_CENTER);
                    }).
                    should.notify(done);
                });
            } else {
                it.skip('This (Chrome) browser is not supported!', function() {});
            }
        });
    });
});