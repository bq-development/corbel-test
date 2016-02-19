var _ = require('lodash');
var common = require('./common');
var fixtures = require('./fixtures');
var config = require('../.tmp/config.js');
var $ = require('jquery');
var localConfig = require('./localConfig').LocalConfig;
var Sidebar = require('./sidebar').Sidebar;
var sidebar = new Sidebar(localConfig);
var ports = require('../test/ports.conf.js');

var corbelTest = {};

var initEnvironment = function(config, process, karma, local) {
    if (karma.config.env && karma.config.env !== undefined) {
        return karma.config.env;
    } else if (local.getEnvironment() !== undefined) {
        return local.getEnvironment();
    } else {
        return process.env.NODE_ENV ? process.env.NODE_ENV : config.ENV;
    }
};

var initLocalServices = function(karma, local) {
    if (local.getLocalServices() !== undefined) {
        return local.getLocalServices();
    } else {
        return (karma.config.localServices) ?
            karma.config.localServices.match(/(^\[(((.)+(,)?)+)\]$)/)[2].split(',') : [];
    }
};

var setupGrep = function(grep) {
    if (grep) {
        var debugHref = $(parent.document).find('a.btn-debug').attr('href');
        $(parent.document).find('a.btn-debug').attr('href', debugHref + '?grep=' + grep);
    }
};

var setupBrowser = function(karma, localServices, environment) {
    common.grep = karma.config.grep;
    if (window.chrome) {
        setupGrep(karma.config.grep);
        sidebar.setup(localServices, environment);
    }
};

var saveLocalConfig = function(environment, localServices) {
    localConfig.setEnvironment(environment);
    localConfig.setLocalServices(localServices);
};

corbelTest.CONFIG = _.cloneDeep(config);

var karma = window.__karma__;
var environment = initEnvironment(config, process, karma, localConfig);
var localServices = initLocalServices(karma, localConfig);
corbelTest.CONFIG.COMMON.urlBase = config.COMMON.urlBase.replace('{{ENV}}', environment);

saveLocalConfig(environment, localServices);
setupBrowser(karma, localServices, environment);

corbelTest.getCustomDriver = function(driverData) {
    var driverConfig = corbelTest.getConfig(undefined, driverData);
    var driver = corbel.getDriver(driverConfig);
    return driver;
};

corbelTest.getConfig = function(clientName, clientData) {
    clientData = clientData || {};
    var data = {
        urlBase: corbelTest.CONFIG.COMMON.urlBase,
        localServices: localServices
    };
    _.each(Object.keys(corbelTest.CONFIG.COMMON.endpoints), function(service) {
        if (_.contains(localServices, service)) {
            data[service + 'Endpoint'] = corbelTest.CONFIG.COMMON.endpoints[service];
        }
    });

    var clientConfig = clientName ? corbelTest.CONFIG[clientName] : clientData;
    return _.extend(data, clientConfig);
};

corbelTest.getCurrentEndpoint = function(moduleName) {
    var driver = this.getCustomDriver({});
    return driver.config.getCurrentEndpoint(moduleName);
};

corbelTest.getAccessToken = function(driver) {
    return driver.config.config.iamToken.accessToken;
};

corbelTest.localConfig = localConfig;
corbelTest.common = common;
corbelTest.fixtures = fixtures;
corbelTest.drivers = common.clients.drivers;
corbelTest.ports = ports;

window.corbelTest = corbelTest;

module.exports = corbelTest;
