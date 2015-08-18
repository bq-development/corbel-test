var sandbox = sinon.sandbox.create();

before(function(done) {

  this.timeout(10000);

  corbelTest.common.clients.loginAll().then(function() {
    done();
  }).catch(function(err) {
    done(err);
  });

});

beforeEach(function() {
  sandbox.restore();
});
