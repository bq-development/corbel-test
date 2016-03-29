/*jshint multistr: true */
describe('In RESOURCES module', function() {
    describe('while using REM-IMAGEs plugin when using blob type images', function() {

        var corbelDriver;
        var dataImage;
        var FOLDER_NAME = 'test:Restor';
        var FILENAME;
        var ORIGINAL_IMAGE_WIDTH = 626;
        var ORIGINAL_IMAGE_HEIGTH = 626;

        function removeDom() {
            document.getElementById('test-image').remove();    
        }

        function getImageAsBlob(imageUrl) {
            var xhttp = new XMLHttpRequest();
            var promise = new Promise(function(resolve, reject){

                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        resolve(xhttp.response);
                    }
                };

                xhttp.open('GET', imageUrl, true);
                xhttp.setRequestHeader('Content-Type', 'image/png');
                xhttp.responseType = 'blob';
                xhttp.send();
            });

            return promise;
        }

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
        });

        beforeEach(function(done) {
            getImageAsBlob('http://' + window.location.host.split(':')[0] + ':' +
                corbelTest.ports.KARMA + '/base/src/common/utils/img/logo.png')
            .then(function(blob) {
                FILENAME = 'RestorFileName' + Date.now();
                dataImage = blob;

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                    dataImage, {
                        dataType: 'image/png',
                    }
                )
                .should.be.eventually.fulfilled;
            })                 
            .should.notify(done);
        });

        afterEach(function(done) {
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

        
        it('image does not surpasses original image size when resize operation is required', function(done) {
            var operationQuery = 'resizeWidth=' + (ORIGINAL_IMAGE_WIDTH + 1);

            corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get({
                dataType: 'image/png',
                customQueryParams: {
                    'image:operations': operationQuery
                },
                responseType: 'blob'
            })
            .should.be.eventually.fulfilled
            .then(function(resource) {
                return corbelTest.common.utils.retry(function() {
                    var reader = new FileReader();
                    reader.readAsDataURL(resource.data);
                    
                    return new Promise(function(resolve, reject) {
                        reader.onloadend = function() {
                            var img = document.createElement('img');   
                            img.id = 'test-image';
                            img.src = reader.result;
                            document.body.appendChild(img); 
                            var image = document.getElementById('test-image');

                            if(image.clientWidth === ORIGINAL_IMAGE_WIDTH) {
                                resolve();
                            }
                            else{
                                reject();
                            }
                            removeDom();
                        };
                    })
                    .should.be.eventually.fulfilled;
                }, 18, 5)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });


        it('image is returned with one image:operation correctly applied', function(done) {
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
                return corbelTest.common.utils.retry(function() {
                    var expectedWidth = ((ORIGINAL_IMAGE_WIDTH * operationHeight) / ORIGINAL_IMAGE_HEIGTH);
                    var reader = new FileReader();
                    reader.readAsDataURL(resource.data);
                    
                    return new Promise(function(resolve, reject) {
                        reader.onloadend = function() {
                            var img = document.createElement('img');   
                            img.id = 'test-image';
                            img.src = reader.result;
                            document.body.appendChild(img); 
                            var image = document.getElementById('test-image');

                            if(image.clientHeight === operationHeight && image.clientWidth === expectedWidth) {
                                resolve();
                            }
                            else {
                                reject();
                            }
                            
                            removeDom();            
                        };     
                    })
                    .should.be.eventually.fulfilled;
                }, 18, 5)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });

        it('image is returned with several image:operation correctly applied', function(done) {
            var resizeWidthValue = 240;
            var resizeHeightValue = 190;
            var operationQuery = 'resizeAndFill=(240,FF00FF);cropFromCenter=(' +
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
                return corbelTest.common.utils.retry(function() {
                    var reader = new FileReader();
                    reader.readAsDataURL(resource.data);
                    return new Promise(function(resolve, reject) {
                        reader.onloadend = function() {
                            var img = document.createElement('img');   
                            img.id = 'test-image';
                            img.src = reader.result;
                            document.body.appendChild(img); 
                            var image = document.getElementById('test-image');

                            if(image.clientHeight === resizeHeightValue && image.clientWidth === resizeWidthValue) {
                                resolve();
                            }
                            else {
                                reject();
                            }
                            removeDom();     
                        };    
                    })
                    .should.be.eventually.fulfilled;
                }, 18, 5)
                .should.be.eventually.fulfilled;
            })
            .should.notify(done);
        });
    });
});
