(function() {
  //@exclude
  'use strict';
  /*globals corbel */
  //@endexclude

  corbelTest.iam = {};

  corbelTest.iam.createDomain = function(driver, domain) {

    var promise = driver.iam.domain()
      .create(domain)
      .should.eventually.be.fulfilled
      .then(function(response) {
        return driver.iam.domain(response.data)
          .get()
          .should.eventually.be.fulfilled;
      });
    return promise;
  };


  corbelTest.iam.createClientDomain = function(driver, domain, client) {

    var promise = driver.iam.client(domain)
      .create(client)
      .should.eventually.be.fulfilled
      .then(function(response) {
        client.id = response.data;
        return driver.iam.client(domain, client.id)
          .get()
          .should.eventually.be.fulfilled;
      });
    return promise;
  };

})();
