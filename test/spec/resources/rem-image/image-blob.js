/*jshint multistr: true */
/* global $, q*/
describe('In RESOURCES module', function() {
    describe('In RESTOR module, while using REM-IMAGEs plugin', function() {

        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';

        function dataURItoBlob(dataURI) {
            // convert base64 to raw binary data held in a string
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to an ArrayBuffer
            var arrayBuffer = new ArrayBuffer(byteString.length);
            var _ia = new Uint8Array(arrayBuffer);

            for (var i = 0; i < byteString.length; i++) {
                _ia[i] = byteString.charCodeAt(i);
            }

            var blob = new Blob([_ia], {
                type: mimeString
            });

            return blob;
        }

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'];
        });

        describe('When using blob type images', function() {

            var dataImage;
            var originalImageWidth;
            var FILENAME;

            before(function(done) {

                $('#mocha').append('<canvas id="myCanvas" width="626" height="626"></canvas>');
                var canvas = document.getElementById('myCanvas');
                var context = canvas.getContext('2d');
                var imageObj = new Image();

                imageObj.onload = function() {
                    context.drawImage(imageObj, 0, 0);
                    dataImage = dataURItoBlob(canvas.toDataURL());
                    originalImageWidth = this.width;
                    done();
                };

                imageObj.src = 'base/src/common/utils/img/logo.png';

            });

            beforeEach(function() {
                FILENAME = 'RestorFileName' + Date.now();

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                    dataImage, {
                        dataType: 'image/png',
                    }
                ).
                should.be.eventually.fulfilled;
            });

            afterEach(function(done) {
                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).delete({
                    dataType: 'image/png'
                }).
                should.be.eventually.fulfilled.
                then(function() {
                    return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                        dataType: 'image/png'
                    }).
                    should.be.eventually.rejected;
                }).
                then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                }).
                should.notify(done);
            });

            it('Image does not surpasses original image size when resize operation is required', function(done) {
                var operationQuery = '{}&image:operations=resizeWidth='+ (originalImageWidth + 1);

                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                    dataType: 'image/png',
                    query: operationQuery,
                    responseType: 'blob'
                }).
                should.be.eventually.fulfilled.
                then(function(resource) {
                    var reader = new FileReader();
                    var promise = corbelTest.common.utils.createPromise();
                    reader.onloadend = function() {
                        $('#mocha').append('<img src="' + reader.result + '" />');
                        expect($('#mocha img')[0]).to.have.property('clientWidth', originalImageWidth);
                        promise.resolve();
                    };
                    reader.readAsDataURL(resource.data);
                    return promise.promise;
                }).
                should.notify(done);
            });


            it('Image is returned with one image:operation correctly applied', function(done) {
                var operationQuery = '{}&image:operations=resizeHeight=100';

                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                    dataType: 'image/png',
                    query: operationQuery,
                    responseType: 'blob'
                }).
                should.be.eventually.fulfilled.
                then(function(resource) {
                    var reader = new FileReader();
                    var promise = corbelTest.common.utils.createPromise();
                    reader.onloadend = function() {
                        $('#mocha').append('<img src="' + reader.result + '" />');
                        expect($('#mocha img')[0]).to.have.property('clientWidth', 100);
                        promise.resolve();
                    };
                    reader.readAsDataURL(resource.data);
                    return promise.promise;
                }).
                should.notify(done);
            });

            it('Image is returned with several image:operation correctly applied', function(done) {
                var operationQuery = '{}&image:operations=resizeAndFill=(240,FF00FF);+cropFromCenter=(240, 190)';

                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                    dataType: 'image/png',
                    query: operationQuery,
                    responseType: 'blob'
                }).
                should.be.eventually.fulfilled.
                then(function(resource) {
                    var reader = new FileReader();
                    var promise = corbelTest.common.utils.createPromise();
                    reader.onloadend = function() {
                        $('#mocha').append('<img src="' + reader.result + '" />');
                        expect($('#mocha img')[0]).to.have.property('clientWidth', 240);
                        promise.resolve();
                    };
                    reader.readAsDataURL(resource.data);
                    return promise.promise;
                }).
                should.notify(done);
            });
            after(function() {
                $('#myCanvas').remove();
            });
        });
        afterEach(function() {
            $('#mocha img').remove();
        });
    });
});
