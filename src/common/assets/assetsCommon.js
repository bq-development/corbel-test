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

function createAsset(count, userId) {
    return {
        userId: userId,
        name: 'createAssetTest' + count,
        productId: String(Date.now()),
        expire: getExpire(),
        active: true,
        scopes: ['custom:test;type=Custom;customId=' + count]
    };
}

function createMultipleAssets(driver, count, userId) {
    var promises = [];
    for (var i = 0; i <= count; i++) {
        var promise = driver.assets().create(createAsset(i, userId));
        promises.push(promise);
    }
    return Promise.all(promises);
}


module.exports = {
    getExpire : getExpire,
    getAsset : getAsset,
    createAsset : createAsset,
    createMultipleAssets : createMultipleAssets
};
