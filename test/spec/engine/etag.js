describe('In ENGINE silkroad modules ', function() {

    describe('when request etag ', function() {

        var corbelDriver;
        var endpoints = [{
            name: 'oauth',
            endpoint: 'oauthEndpoint'
        }, {
            name: 'iam',
            endpoint: 'iamEndpoint'
        }, {
            name: 'evci',
            endpoint: 'evciEndpoint'
        }, {
            name: 'ec',
            endpoint: 'ecEndpoint'
        }, {
            name: 'assets',
            endpoint: 'assetsEndpoint'
        }, {
            name: 'bqpon',
            endpoint: 'bqponEndpoint'
        }, {
            name: 'notifications',
            endpoint: 'notificationsEndpoint'
        }, {
            name: 'webfs',
            endpoint: 'webfsEndpoint'
        }, {
            name: 'borrow',
            endpoint: 'borrowEndpoint'
        }, {
            name: 'scheduler',
            endpoint: 'schedulerEndpoint'
        }];

        endpoints.forEach(function(endpointEntry) {
            it('[SANITY] in ' + endpointEntry.name, function(done) {
                var etag;
                var url = getVersionEndpoint(corbelTest.getCurrentEndpoint(endpointEntry.name));
                callUrl(url).
                should.be.eventually.fulfilled.
                then(function(response) {
                    expect(response.headers).to.have.property('etag');
                    etag = response.headers.etag;
                    return callUrl(url, etag).
                    should.be.eventually.fulfilled;
                }).
                then(function(response) {
                    expect(response.statusCode).to.be.equals(304);
                    expect(response.data).to.be.equals('');
                }).
                should.notify(done);
            });
        });

        describe('[SANITY] in resources ', function() {
            //WARNING: This test require previously resources uploaded in resmi and restor.

            var resourceId = 'resourceEtagId';
            var COLLECTION_NAME = 'test:TestObjectProd';

            var prodCredentials = corbelTest.CONFIG.PRODUCTION_CREDENTIALS.DEFAULT_USER_IAM;

            before(function(done) {
                corbelDriver = corbelTest.getCustomDriver(prodCredentials);
                corbelDriver.domain('silkroad-qa-prod').resources.resource(COLLECTION_NAME, resourceId).get().
                should.be.eventually.fulfilled.and.notify(done);
            });

            it('(resmi) with resource', function(done) {
                var etag;
                var url = corbelTest.getCurrentEndpoint('resources') + 
                'silkroad-qa-prod/resource/' + COLLECTION_NAME + '/' + resourceId;
                callUrl(url, null, 'application/json', corbelDriver.config.config.iamToken.accessToken).
                should.be.eventually.fulfilled.
                then(function(response) {
                    expect(response.headers).to.have.property('etag');
                    etag = response.headers.etag;
                    return callUrl(url, etag, 'application/json', corbelDriver.config.config.iamToken.accessToken).
                    should.be.eventually.fulfilled;
                }).
                then(function(response) {
                    expect(response.statusCode).to.be.equals(304);
                    expect(response.data).to.be.equals('');
                }).
                should.notify(done);
            });

            it('(resmi) with collection', function(done) {
                var etag;
                var url = corbelTest.getCurrentEndpoint('resources') + 'silkroad-qa-prod/resource/' + COLLECTION_NAME;
                callUrl(url, null, 'application/json', corbelDriver.config.config.iamToken.accessToken).
                should.be.eventually.fulfilled.
                then(function(response) {
                    expect(response.headers).to.have.property('etag');
                    etag = response.headers.etag;
                    return callUrl(url, etag, 'application/json', corbelDriver.config.config.iamToken.accessToken).
                    should.be.eventually.fulfilled;
                }).
                then(function(response) {
                    expect(response.statusCode).to.be.equals(304);
                    expect(response.data).to.be.equals('');
                }).
                should.notify(done);
            });

            it('(restor)', function(done) {
                var etag;
                var url = corbelTest.getCurrentEndpoint('resources') +
                    'silkroad-qa-prod/resource/' + COLLECTION_NAME + '/' + resourceId;
                callUrl(url, null, 'text/plain', corbelDriver.config.config.iamToken.accessToken).
                should.be.eventually.fulfilled.
                then(function(response) {
                    expect(response.headers).to.have.property('etag');
                    etag = response.headers.etag;
                    return callUrl(url, etag, 'text/plain', corbelDriver.config.config.iamToken.accessToken).
                    should.be.eventually.fulfilled;
                }).
                then(function(response) {
                    expect(response.statusCode).to.be.equals(304);
                    expect(response.data).to.be.equals('');
                }).
                should.notify(done);

            });

            it('(restor) multiple', function(done) {
                var etag;
                var url = corbelTest.getCurrentEndpoint('resources') +
                    'silkroad-qa-prod/resource/' + COLLECTION_NAME + '/' + resourceId;
                callUrl(url, null, 'text/plain', corbelDriver.config.config.iamToken.accessToken).
                should.be.eventually.fulfilled.
                then(function(response) {
                    expect(response.headers).to.have.property('etag');
                    etag = response.headers.etag;
                    var promises = [];
                    for (var index = 0; index < 200; index++) {
                        var data = {};
                        data[index] = index;
                        promises.push(
                            callUrl(url, etag, 'text/plain', corbelDriver.config.config.iamToken.accessToken)
                        );
                    }
                    return Promise.all(promises).
                    should.be.eventually.fulfilled;
                }).
                then(function(response) {
                    expect(response).to.be.an('array').to.have.length(200);
                    response.forEach(function(element) {
                        expect(element.statusCode).to.be.equals(304);
                        expect(element.data).to.be.equals('');
                    });
                }).
                should.notify(done);

            });
        });
    });

    function callUrl(url, etag, accept, token) {
        etag = etag ? '&etag=' + etag : '';
        accept = accept ? '&accept=' + accept : '';
        token = token ? '&token=' + token : '';
        var xhttp = new XMLHttpRequest();
        return new Promise(function(resolve, reject) {
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                }
            };

            xhttp.open('GET', 'http://' + window.location.host.split(':')[0] + ':' +
                corbelTest.ports.EXPRESS +
                '/httpRequest?url=' + url + etag + accept + token, true);
            xhttp.send();
        });
    }

    function getVersionEndpoint(endpoint) {
        return endpoint.replace(/\/v\d\.\d.*/, '') + '/version';
    }
});