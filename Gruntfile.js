'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var PKG = require('./package.json');
  var CONFIG = PKG.config || {};
  CONFIG.src = CONFIG.src || 'src';
  CONFIG.tmp = CONFIG.tmp || '.tmp';
  CONFIG.test = CONFIG.test || 'test';

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: CONFIG,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: [
          '<%= yeoman.src %>/**/*.js',
          '<%= yeoman.test %>/**/*.js',
          'Gruntfile.js'
        ],
        tasks: ['jshint']
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          '<%= yeoman.src %>/**/*.js',
          '<%= yeoman.test %>/**/*.js',
          'Gruntfile.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      all: '<%= yeoman.tmp %>'
    },

    // Test settings
    karma: {
      options: {
        configFile: 'test/karma.conf.js'
      },
      unit: {
        singleRun: true
      },
      serve: {
        singleRun: false,
        browsers: [
          'Chrome'
        ]
      }
    }
  });

  grunt.registerTask('common', '', [
    'clean',
    'jshint',
    'config'
  ]);

  grunt.registerTask('serve:test', '', [
    'common',
    'karma:serve'
  ]);

  grunt.registerTask('test', [
    'common',
    'karma:unit'
  ]);

  grunt.registerTask('config', '', function() {

    var config = grunt.file.readJSON('.corbeltest');
    grunt.file.write(CONFIG.tmp +
      '/config.js', '\ncorbelTest.CONFIG = ' +
      JSON.stringify(config, null, '  ') +
      '\n');

  });

  grunt.registerTask('default', ['test']);
};
