'use strict';

/*
 * Common Requests for Resources module
 */

function addToCollection (driver, collectionName, data) {
    return driver.resources.collection(collectionName)
        .add(data);
}

module.exports = {
    addToCollection: addToCollection
};
