describe('In CorbelJS module', function(){

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
    	return corbelDriver.resources.resource(COLLECTION, RESORUCE_NAME).get({
        	dataType:'application/json',
        	headers: {
        		'RequestCookie': getStringOfLength(headerLength)
        	}
        });
	};

	before(function(done){
		return corbelDriver.resources.resource(COLLECTION, RESORUCE_NAME).update({
			'obj1': 'obj1value',
			'obj2': 'obj2value'
		}).
        should.eventually.be.fulfilled.and.notify(done);
	});
	
	after(function(done){
		return corbelDriver.resources.resource(COLLECTION, RESORUCE_NAME).delete().
        should.eventually.be.fulfilled.and.notify(done);
	});

    describe('when large headers are sent in the request', function(){
	    it('server supports 1024 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(1024).
	        should.be.eventually.fulfilled.
	        then(function(response) {
	            expect(response).to.have.property('status').and.equals(200);
	            expect(response.data).to.include.keys('obj1');
	        }).
            should.notify(done);
	    });

	    it('server supports 2048 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(2048).
	        should.be.eventually.fulfilled.
	        then(function(response) {
	            expect(response).to.have.property('status').and.equals(200);
	            expect(response.data).to.include.keys('obj1');
	        }).
            should.notify(done);
	    });

	    it('server supports 4096 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(4096).
	        should.be.eventually.fulfilled.
	        then(function(response) {
	            expect(response).to.have.property('status').and.equals(200);
	            expect(response.data).to.include.keys('obj1');
	        }).
            should.notify(done);
	    });

	    /**
		    If you are up to modify this test, please be aware of that while performing 8k header length request
		    or above, nginx returns '400 - Request Header Or Cookie Too Large'.
		    Since nginx replies without including CORS headers in the response, the response is detected as
		    an illegal one, our libraries refuses to reveal the real response and masks the problem with default
		    responses values ->  {data: "", status: 200, headers: undefined, xhr: XMLHttpRequest}.
	    */
	    it('server does not support 8192 bytes long request headers', function(done) {
	    	requestAndVerifyWithCustomHeaderLength(8192).
	        should.be.eventually.fulfilled.
	        then(function(response) {
	            expect(response).not.to.include.deep.keys('data.obj1');
				expect([200, 400]).to.include.members([response.status]);
	        }).
            should.notify(done);
	    });
    });
});
