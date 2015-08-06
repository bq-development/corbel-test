// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-10-22 using
// generator-karma 0.8.3

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['mocha-debug', 'mocha', 'chai', 'chai-as-promised', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      // PhantomJS Promise polifyll
      // http://stackoverflow.com/questions/29391111/karma-phantomjs-and-es6-promises
      'node_modules/babel-core/browser-polyfill.js',
      'node_modules/q/q.js',
      'bower_components/corbel-js/dist/corbel.js',
      'bower_components/underscore/underscore.js',
      'src/corbel-test.module.js',
      'src/**/*.js',
      //'src/**/*.css',
      '.tmp/**/*.js',
      'test/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-mocha-debug',
      'karma-mocha-reporter',
      'karma-chai-plugins',
      'karma-sinon'
    ],
    phantomjsLauncher: {
      flags: ['--web-security=no']
    },

        // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    client: {
      mocha: {
        reporter: 'html' // change Karma's debug.html to the mocha web reporter
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['mocha'],

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
