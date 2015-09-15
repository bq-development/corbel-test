describe('In RESOURCES module', function() {

    describe('In RESMI module, while testing collection queries', function() {
        var corbelDriver;
        var COLLECTION = 'test:CorbelJSObjectQuery' + Date.now();
        var amount = 10;
        var count;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .should.be.eventually.fulfilled.and.notify(done);
        });

        describe('when get collection using "greater than" query language', function(){
            
            it('used timestamp parameter in the query applying to _updateAt field', function(done){
                var date;
                var updateParams = { randomField : 'qwer' };
                var queryParams;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    date = response.data[0]._updatedAt;
                    queryParams = {
                              query: [{
                                  '$gt': {
                                      _updatedAt : date
                                  }
                              }]
                    };
                    firstElementId = response.data[0].id;

                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    count = response.data.length;
                    return corbelDriver.resources.resource(COLLECTION, firstElementId)
                    .update(updateParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', count + 1);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('used ISODate parameter in the query applying to _updateAt field', function(done){
                var date;
                var updateParams = { randomField : 'qwer' };
                var queryParams;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    date = 'ISODate(' + new Date(response.data[0]._updatedAt).toISOString() + ')';
                    queryParams = {
                              query: [{
                                  '$gt': {
                                      _updatedAt : date
                                  }
                              }]
                    };
                    firstElementId = response.data[0].id;

                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    count = response.data.length;
                    return corbelDriver.resources.resource(COLLECTION, firstElementId)
                    .update(updateParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', count + 1);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('used ISODate parameter in the query applying to _createAt field', function(done){
                var queryParams = {
                              query: [{
                                  '$gt': {
                                      _createdAt : 'ISODate(' + new Date(Date.now()).toISOString() + ')'
                                  }
                              }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(queryParams)
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('used timestamp parameter in the query applying to _createAt field', function(done){
                var queryParams = {
                              query: [{
                                  '$gt': {
                                      _createdAt : Date.now()
                                  }
                              }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(queryParams)
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

        });

        describe('when get collection using "lower than" query language', function(){

            it('used timestamp parameter in the query applying to _updateAt field', function(done){
                var date;
                var updateParams = { randomField : 'qwer' };
                var queryParams;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    date = response.data[0]._updatedAt;
                    queryParams = {
                              query: [{
                                  '$lt': {
                                      _updatedAt : date
                                  }
                              }]
                    };
                    firstElementId = response.data[0].id;

                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    count = response.data.length;
                    return corbelDriver.resources.resource(COLLECTION, firstElementId)
                    .update(updateParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', count);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('used ISODate parameter in the query applying to _updateAt field', function(done){
                var date;
                var updateParams = { randomField : 'qwer' };
                var queryParams;
                var count;
                var firstElementId;

                corbelDriver.resources.collection(COLLECTION)
                .get()
                .should.be.eventually.fulfilled
                .then(function(response){
                    date = 'ISODate(' + new Date(response.data[0]._updatedAt).toISOString() + ')';
                    queryParams = {
                              query: [{
                                  '$lt': {
                                      _updatedAt : date
                                  }
                              }]
                    };
                    firstElementId = response.data[0].id;

                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    count = response.data.length;
                    return corbelDriver.resources.resource(COLLECTION, firstElementId)
                    .update(updateParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(){
                    return corbelDriver.resources.collection(COLLECTION)
                    .get(queryParams)
                    .should.be.eventually.fulfilled;
                })
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', count);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('used ISODate parameter in the query applying to _createAt field', function(done){
                var queryParams = {
                              query: [{
                                  '$lt': {
                                      _createdAt : 'ISODate(' + new Date(Date.now()).toISOString() + ')'
                                  }
                              }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(queryParams)
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('used timestamp parameter in the query applying to _createAt field', function(done){
                var queryParams = {
                              query: [{
                                  '$lt': {
                                      _createdAt : Date.now()
                                  }
                              }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(queryParams)
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.be.eventually.fulfilled.and.notify(done);
            });

        });

    });
});
