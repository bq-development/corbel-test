describe('In IAM module', function() {

    describe('while testing create user with oauth identity', function(){

        var corbelDriver;
        var userId;
        var domainId = corbelTest.CONFIG.DOMAIN;
        var domainDefaultScopes;
        var random = Date.now();
        var oauthIdentifier;
        var oauthCommon;
        var oauthUserTest;
        var token;
        var emailDomain = '@funkifake.com';

        var userTest = {
            'username': 'createUserOauthTest' + random,
            'password': 'passwordTest',
            'email': 'createUserOauthTest' + random + emailDomain
        };

        var user = {
            'firstName': 'createUserIam' + random,
            'email': 'createUserIam.iam.' + random + emailDomain,
            'username': 'createUserIam.iam.' + random + emailDomain
        };

        before(function(done) {

            oauthCommon = corbelTest.common.oauth;
            oauthUserTest = oauthCommon.getOauthUserTestParams();
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelTest.drivers['ROOT_CLIENT'].clone()
                .domain(domainId).iam.domain()
                .get()
                .then(function(domain){
                    domainDefaultScopes = domain.data.defaultScopes;
                })
                .then(function(){
                   return corbelDriver.oauth
                        .user(oauthCommon.getClientParams())
                        .create(userTest)
                        .should.be.eventually.fulfilled;
                })
                .then(function () {
                    return corbelDriver.oauth
                        .authorization(oauthCommon.getClientParamsCode())
                        .login(userTest.username, userTest.password)
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    return corbelDriver.oauth
                        .token(oauthCommon.getClientParamsToken())
                        .get(response.data.query.code)
                        .should.be.eventually.fulfilled;
                })
                .then(function (response) {
                    token = response.data['access_token'];

                    return corbelDriver.oauth
                        .user(oauthCommon.getClientParams(), token)
                        .get('me')
                        .should.be.eventually.fulfilled;
                })
                .then(function(id){
                    oauthIdentifier = id.data.id;
                })
                .should.notify(done);
        });

        it.only('Logged in using oauth identity', function(done){
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelDriver.iam.users()
                .create(user)       
                .should.be.eventually.fulfilled
                .then(function(id) {
                    userId = id;

                    return corbelDriver.iam.user(userId)
                        .addIdentity({
                            'oauthService': 'silkroad',
                            'oauthId': oauthIdentifier
                        });
                })
                .then(function(){
                    return corbelTest.common.clients.loginUser(corbelDriver, userTest.username, userTest.password)
                            .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});