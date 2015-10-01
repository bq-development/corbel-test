//@exclude
'use strict';
/*globals corbel */
//@endexclude


function getExpire() {
    return Math.round((new Date().getTime() / 1000)) + 7203500;
}

function getAsset(scopes) {
    return {
        userId: '1',
        name: 'createAssetTest',
        productId: String(Date.now()),
        expire: getExpire(),
        active: true,
        scopes: scopes || ['assets:asset', 'resources:music:edit_playlist']
    };
}

function createMultipleAssets(driver, count, userId) {

    var promises = [];
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

    for (var i = 0; i <= count; i++) {
        var asset = createAsset(i, userId);
        var promise = driver.assets().create(asset);
        promises.push(promise);
    }
    return Promise.all(promises);
}


module.exports = {
    getExpire : getExpire,
    getAsset : getAsset,
    createMultipleAssets : createMultipleAssets
};
