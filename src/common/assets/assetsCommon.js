//@exclude
'use strict';
/*globals corbel */
//@endexclude


function getExpire() {
    return Math.round((new Date().getTime())) + 7203500;
}

function getAsset(scopes) {
    return {
        userId: '1',
        name: 'createAssetTest',
        productId: String(Date.now()),
        expire: getExpire(),
        active: true,
        scopes: scopes || ['assets:test']
    };
}

function createMultipleAssets(driver, count, userId) {
    var createAsset = function(customId, userId) {
        return {
            userId: userId,
            name: 'createAssetTest' + customId,
            productId: String(Date.now()),
            expire: getExpire(),
            active: true,
            scopes: ['custom:test;type=Custom;customId=' + customId]
        };
    };

    var promises = [];
    for (var i = 0; i <= count; i++) {
        var asset = createAsset(i, userId);
        promises.push(driver.assets.asset().create(asset));
    }

    return Promise.all(promises);
}


module.exports = {
    getExpire: getExpire,
    getAsset: getAsset,
    createMultipleAssets: createMultipleAssets
};
