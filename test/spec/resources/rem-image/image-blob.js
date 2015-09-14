/*jshint multistr: true */
describe('In RESOURCES module', function() {
    describe('In RESTOR module, while using REM-IMAGEs plugin', function() {

        var corbelDriver;
        var FOLDER_NAME = 'test:Restor';
        var canvasContainer;

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
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        describe('when using blob type images', function() {

            var dataImage;
            var originalImageWidth, originalImageHeigth;
            var FILENAME;

            before(function(done) {

                canvasContainer = document.getElementById('mocha');
                canvasContainer.insertAdjacentHTML(
                    'beforeend',
                    '<canvas id="myCanvas" width="626" height="626"></canvas>');
                var canvas = document.getElementById('myCanvas');
                var context = canvas.getContext('2d');
                var imageObj = new Image();

                imageObj.onload = function() {
                    context.drawImage(imageObj, 0, 0);
                    dataImage = dataURItoBlob(canvas.toDataURL());
                    originalImageWidth = this.width;
                    originalImageHeigth = this.height;
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
                )
                .should.be.eventually.fulfilled;
            });

            afterEach(function(done) {
                document.getElementById('test-image').remove();

                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).delete({
                    dataType: 'image/png'
                })
                .should.be.eventually.fulfilled
                .then(function() {
                    return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                        dataType: 'image/png'
                    })
                    .should.be.eventually.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');
                })
                .should.notify(done);
            });

            after(function() {
                document.getElementById('myCanvas').remove();
            });

            it('Image does not surpasses original image size when resize operation is required', function(done) {
                var operationQuery = 'resizeWidth=' + (originalImageWidth + 1);

                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                    dataType: 'image/png',
                    customQueryParams: {
                            'image:operations': operationQuery
                    },
                    responseType: 'blob'
                })
                .should.be.eventually.fulfilled
                .then(function(resource) {
                    var reader = new FileReader();
                    var dfd = corbelTest.common.utils.createDeferred();
                    reader.onloadend = function() {
                        var container = document.getElementById('mocha');
                        container.insertAdjacentHTML(
                            'beforeend',
                            '<img id="test-image" src="' + reader.result + '" />');
                        var image = document.getElementById('test-image');
                        expect(image.clientWidth).to.be.equal(originalImageWidth);
                        dfd.resolve();
                    };
                    reader.readAsDataURL(resource.data);
                    return dfd.promise;
                })
                .should.notify(done);
            });


            it('Image is returned with one image:operation correctly applied', function(done) {
                var operationHeight = 100;
                var operationQuery = 'resizeHeight=' + operationHeight;

                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                    dataType: 'image/png',
                    customQueryParams: {
                            'image:operations': operationQuery
                    },
                    responseType: 'blob'
                })
                .should.be.eventually.fulfilled
                .then(function(resource) {
                    var expectedWidth = ((originalImageWidth * operationHeight) / originalImageHeigth);
                    var reader = new FileReader();
                    var dfd = corbelTest.common.utils.createDeferred();
                    reader.onloadend = function() {
                        var container = document.getElementById('mocha');
                        container.insertAdjacentHTML(
                            'beforeend',
                            '<img id="test-image" src="' + reader.result + '" />');
                        var image = document.getElementById('test-image');
                        expect(image).to.have.property('clientHeight', operationHeight);
                        expect(image).to.have.property('clientWidth', expectedWidth);
                        dfd.resolve();
                    };
                    reader.readAsDataURL(resource.data);
                    return dfd.promise;
                })
                .should.notify(done);
            });

            it('Image is returned with several image:operation correctly applied', function(done) {
                var resizeWidthValue = 240;
                var resizeHeightValue = 190;
                var operationQuery =
                    'resizeAndFill=(240,FF00FF);+cropFromCenter=(' +
                    resizeWidthValue + ',' + resizeHeightValue + ')';

                corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                    dataType: 'image/png',
                    customQueryParams: {
                            'image:operations': operationQuery
                    },
                    responseType: 'blob'
                })
                .should.be.eventually.fulfilled
                .then(function(resource) {
                    var reader = new FileReader();
                    var dfd = corbelTest.common.utils.createDeferred();
                    reader.onloadend = function() {
                        var container = document.getElementById('mocha');
                        container.insertAdjacentHTML(
                            'beforeend',
                            '<img id="test-image" src="' + reader.result + '" />');
                        var image = document.getElementById('test-image');
                        expect(image.clientHeight).to.be.equal(resizeHeightValue);
                        expect(image.clientWidth).to.be.equal(resizeWidthValue);
                        dfd.resolve();
                    };
                    reader.readAsDataURL(resource.data);
                    return dfd.promise;
                })
                .should.notify(done);
            });
        });
    });
});
