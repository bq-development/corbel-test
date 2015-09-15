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
        	dataType:'application/json',
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

	    it('server does not support 7680 bytes (7.5k) long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(7680).
	        should.be.eventually.rejected.
	        then(function(e) {
	            expect(e).to.have.property('status').and.not.equals(400);
	            expect(e).to.have.property('status').and.below(500);
	        }).
            should.notify(done);
	    });

	    /**
		    When performing 8k header long request or above, nginx returns '400 - Request Header Or Cookie Too Large'.
		    Since nginx replies without including CORS headers in the response, the response is detected as
		    illegal, our libraries refuses to reveal the real response and masks the problem with default responses 
		    values ->  {data: "", status: 200, headers: undefined, xhr: XMLHttpRequest}.
			These test have the purpose of guaranteeing a working baseline.
	    */
    });
});