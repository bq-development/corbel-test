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
        var authorize;

        var userOauth = {
            'username': 'createUserOauthTest' + random,
            'password': 'passwordTest',
            'email': 'createUserOauthTest' + random + emailDomain
        };

        var userIam = {
            'firstName': 'createUserIam' + random,
            'email': 'createUserIam.iam.' + random + emailDomain,
            'username': 'createUserIam.iam.' + random + emailDomain
        };

        before(function(done) {

            oauthCommon = corbelTest.common.oauth;
            oauthUserTest = oauthCommon.getOauthUserTestParams();
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            authorize = corbelDriver.oauth.authorization(oauthCommon.getClientParamsCodeIAM(corbelDriver));
            corbelDriver.oauth
                        .user(oauthCommon.getClientParams())
                .create(userOauth)
                .should.be.eventually.fulfilled
                .then(function () {
                    return corbelDriver.oauth
                        .authorization(oauthCommon.getClientParamsCode())
                        .login(userOauth.username, userOauth.password)
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

        after(function(done){
            authorize.signout()
                        .should.be.eventually.fulfilled
                        .should.notify(done);
        });

        it('Logged in using oauth identity', function(done){
            var setCookie = false;
            var noRedirect = true;

            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelDriver.iam.users()
                .create(userIam)       
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
                    return authorize
                        .login(userOauth.email, userOauth.password, setCookie, noRedirect)
                        .should.be.eventually.fulfilled;
                })
                .should.notify(done);
        });
    });
});