//@exclude
'use strict';
/*globals corbel */
//@endexclude

var superagent = require('superagent');

var createdQueryObject = [];
var createdRelationObject = [];

var successHandler = function(list, collection, id) {
    list.push({
        collection: collection,
        id: id
    });
};

var createIntegerSecuence = function(length) {
    var list = [];
    for (var i = 1; i <= length; i++) {
        list.push(i);
    }
    return list;
};

var relationSuccessHandler = function(list, collectionA, idA, collectionB, idB) {
    list.push({
        collectionA: collectionA,
        idA: idA,
        collectionB: collectionB,
        idB: idB
    });
};

function createdObjectsToQuery(driver, collectionName, amount, extraField) {
    var promises = [];
    var year = 2015;
    var month = 6;

    for (var count = 1; count <= amount; count++) {
        var json = {
            stringField: 'stringFieldContent' + count,
            intField: 100 * count,
            computableField: count + (1/3),
            stringSortCut: 'Test Short Cut',
            codingTest: 'ñÑçáéíóúàèìòùâêîôû\'',
            ObjectNumber: createIntegerSecuence(count),
            ObjectMatch: [{
                name: 'basic',
                identifier: 'id' + count,
                type: 'basic'
            }, {
                name: 'premium',
                identifier: 'id' + count,
                type: 'premium'
            }],
            randomField: 'asdf'
        };

        if(extraField) {
            json.extra = extraField;
        }

        var promise = driver.resources.collection(collectionName).add(json);
        promises.push(promise);
        promise.then(successHandler.bind(this, createdQueryObject, collectionName)); //jshint ignore: line
    }
    return Promise.all(promises);
}

function cleanResourcesQuery(driver) {
    var promises = [];
    createdQueryObject.forEach(function(entry) {
        var promise = driver.resources.resource(entry.collection, entry.id).delete();
        promises.push(promise);
    });
    createdQueryObject = [];
    return Promise.all(promises);
}

function checkSortingAsc(resourceList, field) {
    return checkSorting(resourceList, field, function(previous, next) {
        return previous <= next;
    });
}

function checkSortingDesc(resourceList, field) {
    return checkSorting(resourceList, field, function(previous, next) {
        return previous >= next;
    });
}

function checkSorting(resourceList, field, compareFunction) {
    var lastValue = getProperty(resourceList[0], field);
    return resourceList.every(function(resource) {
        return compareFunction(lastValue, getProperty(resource, field)) ?
            (lastValue = getProperty(resource, field)) === lastValue : false;
    });
}

function getProperty(obj, prop) {
    var parts = prop.split('.'),
        last = parts.pop(),
        length = parts.length,
        count = 1,
        current = parts[0];

    if (length === 0) {
        return obj[prop];
    }

    while ((obj = obj[current]) && count < length) {
        current = parts[count];
        count++;
    }

    if (obj) {
        return obj[last];
    }
}

function createRelationFromSingleObjetToMultipleObject(driver, collectionA, idResourceInA, collectionB, idResourceInB) {
        var promises = [];

        idResourceInB.forEach(function(idB, count) {
            var jsonRelationData = {
                intField: Date.now(),
                intCount: 100 * count,
                stringField: 'stringContent' + count,
                stringSortCut: 'Test Short Cut',
                ObjectNumber: createIntegerSecuence(count)
            };

            var promise = driver.resources.relation(collectionA, idResourceInA, collectionB).add(idB, jsonRelationData);
            promises.push(promise);
            promise.then(relationSuccessHandler.bind
                    (this, createdRelationObject, collectionA, idResourceInA, collectionB, idB));
        });

        return Promise.all(promises);
}

function deleteCreatedRelationObjects(driver) {
    var promises = [];
    createdRelationObject.forEach(function(createdRelation) {
        var promise = driver.resources.relation
            (createdRelation.collectionA, createdRelation.idA, createdRelation.collectionB)
        .delete(createdRelation.idB);
        promises.push(promise);
    });
    return Promise.all(promises);
}

function fastMove(driver, idResource1, idResource2, repeatTimes, COLLECTION_A, idResourceInA, COLLECTION_B) {
    return driver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
    .move(idResource1, 2)
    .should.eventually.be.fulfilled
    .then(function() {
        if (repeatTimes) {
            return fastMove(driver, idResource2, idResource1, repeatTimes - 1,
              COLLECTION_A, idResourceInA, COLLECTION_B);
        } else {
            return idResource2;
        }
    });
}

function repeatMove(driver, idResource, repeatTimes, COLLECTION_A, idResourceInA, COLLECTION_B, params, amount) {
    return driver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
    .move(idResource, 2)
    .should.eventually.be.fulfilled
    .then(function() {
        return driver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
        .get(null, params)
        .should.eventually.be.fulfilled;
    }).then(function(response) {
        expect(response.data[1].id).to.be.equal(idResource);
        if (repeatTimes) {
            idResource = response.data[amount - 1].id;
            return repeatMove(driver, idResource, repeatTimes - 1,
              COLLECTION_A, idResourceInA, COLLECTION_B, params, amount);
        }
    });
}

module.exports = {
    getProperty : getProperty,
    checkSorting : checkSorting,
    checkSortingDesc : checkSortingDesc,
    createdObjectsToQuery : createdObjectsToQuery,
    cleanResourcesQuery: cleanResourcesQuery,
    checkSortingAsc: checkSortingAsc,
    createRelationFromSingleObjetToMultipleObject : createRelationFromSingleObjetToMultipleObject,
    deleteCreatedRelationObjects : deleteCreatedRelationObjects,
    fastMove : fastMove,
    repeatMove : repeatMove
};
