var _ = require('lodash');
var common = require('./common');
var fixtures = require('./fixtures');
var config = require('../.tmp/config.js');
var corbelTest = {};

corbelTest.CONFIG = _.cloneDeep(config);

//Initialize correct urlBase
var environment = process.env.NODE_ENV ? process.env.NODE_ENV : config.ENV;
corbelTest.CONFIG.COMMON.urlBase = config.COMMON.urlBase.replace('{{ENV}}', environment);

corbelTest.getConfig = function(clientName) {
	var data = {
		urlBase : corbelTest.CONFIG.COMMON.urlBase
	};
	return _.extend(data, corbelTest.CONFIG[clientName]);
};

corbelTest.common = common;
corbelTest.fixtures = fixtures;
corbelTest.drivers = common.clients.drivers;

window.corbelTest = corbelTest;