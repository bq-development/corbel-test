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

module.exports = {
    getExpire : getExpire,
    getAsset : getAsset
};
