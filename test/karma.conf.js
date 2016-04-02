// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-10-22 using
// generator-karma 0.8.3

var fs = require('fs');
var path = require('path');

function fileList(dir) {
  return fs.readdirSync(dir).reduce(function(list, file) {
    var name = path.join(dir, file);
    var isDir = fs.statSync(name).isDirectory();
    return list.concat(isDir ? fileList(name) : [name]);
  }, []);
}

function getFiles(config) {
  var start;
  var end;

  var specFiles = fileList('test/spec').filter(function(filename) { return filename.endsWith('js');});
  var totalSpecFiles = specFiles.length;

  if (config.client && config.client.args[0] && config.client.args[0].parallel) {
    var taskIndex = config.client.args[0].index;
    var totalTasks = config.client.args[0].total;
    var totalByTask = Math.ceil(totalSpecFiles / totalTasks);
    start = taskIndex * totalByTask;
    end = start + totalByTask;
    if (taskIndex+1 === totalTasks) {
      end = totalSpecFiles;
    }
  } else {
    start = 0;
    end = totalSpecFiles;
  }

  var files = [
    // PhantomJS Promise polifyll
    // http://stackoverflow.com/questions/29391111/karma-phantomjs-and-es6-promises
    'node_modules/phantomjs-polyfill/bind-polyfill.js',
    'node_modules/promise-polyfill/Promise.js',
    'node_modules/q/q.js',
    'node_modules/corbel-js/dist/corbel.js',
    'node_modules/lodash/index.js',
    '.tmp/bundle.js',
    'test/beforeAll.js',
    'test/ports.conf.js',
    'test/karma.conf.js',
    'test/menu/css/collapse.css',
    'test/menu/css/onoffswitch.css',
    'test/menu/css/styles.css',
    {pattern: 'test/menu/html/menu.html', watched: false, included: false, served: true},
    {pattern: 'test/menu/html/switch.html', watched: false, included: false, served: true},
    {pattern: 'src/common/utils/img/logo.png', watched: false, included: false, served: true}
  ];

  for (var i=start; i<end; i++) {
    files.push(specFiles[i]);
  }

  return files;
}

module.exports = function (config) {
    'use strict';

    var PORTS = require('./ports.conf.js');

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha', 'chai', 'chai-as-promised', 'chai-things', 'sinon'],

        // list of files / patterns to load in the browser
        files: getFiles(config),
        files2: [
            // PhantomJS Promise polifyll
            // http://stackoverflow.com/questions/29391111/karma-phantomjs-and-es6-promises
            'node_modules/phantomjs-polyfill/bind-polyfill.js',
            'node_modules/promise-polyfill/Promise.js',
            'node_modules/q/q.js',
            'node_modules/corbel-js/dist/corbel.js',
            'node_modules/lodash/index.js',
            '.tmp/bundle.js',
            'test/beforeAll.js',
            'test/**/*.js',
            'test/menu/css/collapse.css',
            'test/menu/css/onoffswitch.css',
            'test/menu/css/styles.css',
            /*Rem-image's test required*/
            {pattern: 'test/menu/html/menu.html', watched: false, included: false, served: true},
            {pattern: 'test/menu/html/switch.html', watched: false, included: false, served: true},
            {pattern: 'src/common/utils/img/logo.png', watched: false, included: false, served: true}
        ],

        // list of files / patterns to exclude
        exclude: [
            'express/server.js',
            'test/spec/private/!(modules)/**/*.js',
            'test/ports.conf.js'
        ],

        // web server port
        port: PORTS.KARMA,


        // Which plugins to enable
        plugins: [
            'karma-*'
        ],
        phantomjsLauncher: {
            flags: [
                '--web-security=no',
                '--ignore-ssl-errors=no'
            ]
        },

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        colors: true,

        browserNoActivityTimeout: 95000,


        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['tap', 'mocha', 'html'],

        tapReporter: {
            outputFile: '.report/report.tap',
            disableStdout: true
        },

        // the default configuration
        htmlReporter: {
            outputDir: '.report',
            templatePath: null, // set if you moved jasmine_template.html
            focusOnFailures: true, // reports show failures on start
            namedFiles: true, // name files instead of creating sub-directories
            pageTitle: null, // page title for reports; browser info by default
            urlFriendlyName: false, // simply replaces spaces with _ for files/dirs
            reportName: 'report-summary-filename', // report summary filename; browser info by default
            // experimental
            preserveDescribeNesting: false, // folded suites stay folded
            foldAll: false, // reports start folded (only with preserveDescribeNesting)
        },

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_DISABLE,

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
    });
};
