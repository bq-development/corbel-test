//describe('In CORBELJS module', timedTest(function() {

  //describe('In RESOURCES module', function() {
    //var corbelDriver;

    //before(function(done) {

      //var clientData = functionUtils.getDefaultClientData();

      //corbelDriver = corbel.getDriver({
        //clientId: clientData.clientId,
        //clientSecret: clientData.clientSecret,
        //urlBase: app.common.get('corbeljsEndpoint'),
        //scopes: clientData.claimScopes
      //});

      //corbelDriver.iam.token().create().then(function() {
        //done();
      //});
    //});

    //after(function() {

    //});


    //describe('resource creation', function() {
      //var fileID;
      //var objectCreated = {
        //name: 'test1' + Date.now(),
        //data: 'test-data'
      //};

      //it('add model to a collection', function(done) {
        //corbelDriver.resources.collection('test:Corbeljs').add(objectCreated).should.eventually.be.fulfilled
          //.then(function(response) {
            //expect(response).to.be.an('string');
            //fileID = response;

            //return corbelDriver.resources
              //.resource('test:Corbeljs', fileID)
              //.get()
              //.should.eventually.be.fulfilled;
          //})
          //.then(function(response) {
            //expect(response.data.name).to.be.equal(objectCreated.name);
            //done();
          //})
          //.catch(function(err){
            //done(err);
          //});
      //});

      //it('update a resource', function(done) {
        //corbelDriver.resources.resource('test:Corbeljs', fileID).update({
          //name: 'test'
        //}).should.eventually.be.fulfilled
          //.then(function(response) {
            //expect(response).to.be.an('object');
            //expect(response.status).to.equals(204);
            //return corbelDriver.resources
              //.resource('test:Corbeljs', fileID)
              //.get()
              //.should.eventually.be.fulfilled;
          //})
          //.then(function(response) {
            //expect(response.data.name).to.be.equal('test');
            //done();
          //})
          //.catch(function(err){
            //done(err);
          //});
      //});

      //it('delete a resource', function(done) {
        //corbelDriver.resources.resource('test:Corbeljs', fileID).delete().should.eventually.be.fulfilled
          //.then(function(response) {
            //expect(response).to.be.an('object');
            //expect(response.status).to.equals(204);
            //return corbelDriver.resources
              //.resource('test:Corbeljs', fileID)
              //.get()
              //.should.eventually.be.rejected;
          //})
          //.then(function(response) {
            //expect(response).to.be.an('object');
            //expect(response.status).to.equals(404);
            //done();
          //})
          //.catch(function(err){
            //done(err);
          //});
      //});


      //describe('Queries', function() {
        //var objects = [{
          //name: 'Hello'
        //}, {
          //name: 'Sandía'
        //}, {
          //name: 'Ñordel'
        //}, {
          //name: 'Chewaçcá Sä++++^*quñardel'
        //}];

        //objects = objects.map(function(item) {
          //item.query = [{
            //'$eq': {
              //'name': item.name
            //}
          //}];
          //return item;
        //});

        //before(function(done) {
          //var promises = objects.map(function(item) {
            //var dfd = q.defer();
            //corbelDriver.resources.collection('test:Corbeljs').add({
              //name: item.name
            //})
              //.then(function(id) {
                //item.id = id;
                //dfd.resolve();
              //});

            //return dfd.promise;
          //});

          //q.all(promises).then(function() {
            //done();
          //}).catch(function(err) {
            //console.log(err);
            //done(err);
          //});
        //});


        //after(function(done) {
          //var promises = objects.map(function(item) {
            //console.log(item);
            //return corbelDriver.resources.resource('test:Corbeljs', item.id).delete();
          //});

          //q.all(promises).then(function() {
            //done();
          //}).catch(function(err) {
            //console.log(err);
            //done(err);
          //});
        //});

        //it('Finds each item', function(done) {
          //var promises = objects.map(function(item) {
            //var dfd = q.defer();

            //corbelDriver.resources.collection('test:Corbeljs')
              //.get({
                //query: item.query
              //})
              //.then(function(response) {
                //expect(response).to.be.an('object');
                //expect(response.status).to.equals(200);
                //expect(response.data.length).to.be.above(0);
                //dfd.resolve();
              //});

            //return dfd.promise;
          //});

          //q.all(promises).then(function() {
            //done();
          //}).catch(function(err) {
            //console.log(err);
            //done(err);
          //});
        //});
      //});



    //});


  //});
//}));
