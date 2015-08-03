var sandbox = sinon.sandbox.create();

before(function(done) {

  this.timeout(10000);

  corbelTest.loginAll().then(function() {
    done();
  }).catch(function(err) {
    done(err);
  });

});

beforeEach(function() {
  sandbox.restore();
});
