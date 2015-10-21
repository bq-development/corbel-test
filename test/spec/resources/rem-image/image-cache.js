describe('In RESOURCES module', function() {
	describe('In RESTOR module, while using REM-IMAGEs plugin', function() {
        describe('When retrieving a cached image', function() {
            var IMAGE_OPS = 'resizeHeight=100';
            var CACHE_FOLDER = 'image:ImageCache';
            var FILENAME;
            var cacheResourceName;
	        var customQueryParamsResourceObj;
            var base64Image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABE0lEQVRI'+
	        'ie3UvUoDQRTF8R9W2vkaVmIUoxZJ/Oh8Aj9A8akttBARISSaYAIWES0yi2EzOztZWw9Ms3Pu/9ydywz/aqAL3KO1Qk0H'+
	        'T7irM15hhm+8YS8TPgk1X7hOmV+CsVjv2M+EF+s5FXCEcalgipOI9xyfJe8Qu6kAwTCMhJxmwLPn1sIgEnJWAR9gJxde'+
	        'qI1RCfRh+czr5pTUNvol4OJ6xVZTeKGW5ZlkH8taRsAm1iPfN8Len3RsPtyqI5oGTyO1Ld+J2JBHGgy5F+l8jAMcRoIn'+
	        '6ObCu5EuxwFcqCqkUwePvS1leCqk+MtKPUS66iX8vUhDj6mAS7/PdR08FjILjKRuzG9vDnwxpI/bFWr+NdcPjJuTxWaE'+
	        '8ccAAAAASUVORK5CYII=';
			var corbelDriver;
	        var FOLDER_NAME = 'test:Restor';

			before(function() {
	            corbelDriver = corbelTest.drivers['ADMIN_CLIENT'].clone();
	        });

            beforeEach(function() {
                FILENAME = 'RestorFileName' + Date.now();

                cacheResourceName = FILENAME + '.' + FOLDER_NAME + '.' + IMAGE_OPS;
                customQueryParamsResourceObj = {
                    'resource:encoding': 'base64',
                    'resource:length': ((base64Image.length * 3 / 4) - base64Image.split('=').length + 1)
                };

                return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                    base64Image, 
                    {
                        dataType:'image/png',
                        customQueryParams: customQueryParamsResourceObj
                    }
                )
                .then(function() {
                    return corbelDriver.resources.resource(FOLDER_NAME, FILENAME).get(
                        {
                            dataType:'image/png',
                            responseType: 'blob',
                            customQueryParams: {
                                    'image:operations': IMAGE_OPS
                            },
                        }
                    )
                    .should.be.eventually.fulfilled;
                })
                .then(function () {
                    return corbelDriver.resources.resource(CACHE_FOLDER, cacheResourceName ).get(
                        {
                            dataType:'image/png',
                            responseType: 'blob',
                        }
                    );
                })
                .should.be.eventually.fulfilled;
            });

            if (window.chrome) {
                it('cache image is removed after updating the original', function(done) {

                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).update(
                        base64Image, 
                        {
                            dataType:'image/png',
                            customQueryParams: customQueryParamsResourceObj
                        }
                    ).
                    should.be.eventually.fulfilled.
                    then(function() {
                        return corbelDriver.resources.resource(CACHE_FOLDER, cacheResourceName ).get(
                            {
                                dataType:'image/png'
                            }
                        ).
                        should.be.eventually.rejected;
                    }).
                    then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    }).
                    should.notify(done);
                });

                it('cache image is removed after deleting the original', function(done) {
                    corbelDriver.resources.resource(FOLDER_NAME, FILENAME).delete({ dataType: 'image/png' }).
	                should.be.eventually.fulfilled.
                    then(function() {
                        return corbelDriver.resources.resource(CACHE_FOLDER, cacheResourceName ).get(
                            {
                                dataType:'image/png'
                            }
                        ).
                        should.be.eventually.rejected;
                    }).
                    then(function(e) {
                        expect(e).to.have.property('status', 404);
                        expect(e).to.have.deep.property('data.error', 'not_found');
                    }).
                    should.notify(done);
                });
            } else {
                it.skip('This (Chrome) browser is not supported!', function() {});
            }
        });
	});
});
