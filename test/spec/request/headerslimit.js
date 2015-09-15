describe('In CORBELJS module', function(){

	var corbelDriver;
	var COLLECTION = 'test:largeRequest	';
	var RESORUCE_NAME = 'resource' + Date.now();
    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    var getStringOfLength = function(strLength){
    	var fixedLength = strLength +1;
		return new Array(fixedLength).join('x');
    };

    var requestAndVerifyWithCustomHeaderLength = function(headerLength){
    	return corbelDriver.resources.resource(COLLECTION, RESORUCE_NAME)
        .get({
        	dataType:'application/octet-stream',
        	headers: {
        		'RequestCookie': getStringOfLength(headerLength)
        	}
        });
	};

    describe('when large headers are sent in the request', function(){
	    it('server supports 1024 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(1024).
	        should.be.eventually.rejected.
	        then(function(e) {
	            expect(e).to.have.property('status').and.not.equals(400);
	            expect(e).to.have.property('status').and.below(500);
	        }).
            should.notify(done);
	    });

	    it('server supports 2048 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(2048).
	        should.be.eventually.rejected.
	        then(function(e) {
	            expect(e).to.have.property('status').and.not.equals(400);
	            expect(e).to.have.property('status').and.below(500);
	        }).
            should.notify(done);
	    });

	    it('server supports 4096 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(4096).
	        should.be.eventually.rejected.
	        then(function(e) {
	            expect(e).to.have.property('status').and.not.equals(400);
	            expect(e).to.have.property('status').and.below(500);
	        }).
            should.notify(done);
	    });

	    it('server does not support 8192 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(8192).
	        should.be.eventually.fulfilled.
	        then(function(e) {
				expect(e).to.have.property('status', 200);
	        }).
            should.notify(done);
	    });

	    it('server does not support 65536 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(65536).
	        should.be.eventually.fulfilled.
	        then(function(e) {
				expect(e).to.have.property('status', 200);
	        }).
            should.notify(done);
	    });
    });
});