
'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var _ = require('lodash');
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
        tasks: ['jshint', 'browserify']
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

    //Bundles for browser
    browserify: {
      dist: {
        files: {
          '.tmp/bundle.js': ['src/main.js'],
        }
      }
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

  grunt.registerTask('config', '', function() {
    var defaultConfig = grunt.file.readJSON('.corbeltest.default');
    var config = grunt.file.exists('.corbeltest') ? grunt.file.readJSON('.corbeltest') : {};
    var finalConfig = {};
    _.extend(finalConfig, defaultConfig, config);
    grunt.file.write(CONFIG.tmp +
      '/config.js', 'module.exports = ' + JSON.stringify(finalConfig, null, 2));
  });

  grunt.registerTask('common', '', [
    'clean',
    'jshint',
    'config',
    'browserify'
  ]);

  grunt.registerTask('server:test', '', [
    'common',
    'karma:serve'
  ]);

  grunt.registerTask('test', [
    'common',
    'karma:unit'
  ]);

  grunt.registerTask('default', ['test']);

  function createCorbelJsLink() {
    var fs = require('fs');

    var localCorbelJsDir = process.cwd() + '/../corbel-js';
    var dependencyCorbelJsDir = process.cwd() + '/node_modules/corbel-js';

    if (grunt.file.isLink(dependencyCorbelJsDir)) {
        console.log('  Deleting link : ' + dependencyCorbelJsDir);
        fs.unlinkSync(dependencyCorbelJsDir);
    } else if (grunt.file.isDir(dependencyCorbelJsDir)) {
        console.log('  Deleting dir: ' + dependencyCorbelJsDir);
        grunt.file.delete(dependencyCorbelJsDir);
    }

    console.log('  Creating link from ' + localCorbelJsDir + ' to ' + dependencyCorbelJsDir);
    fs.symlinkSync(localCorbelJsDir, dependencyCorbelJsDir);
  }

  grunt.registerTask('init-env-links',
      'Links local corbel-js components to node_modules directory (development).',
      createCorbelJsLink);

  function deleteCorbelJsLink() {
    var fs = require('fs');
    var dependencyCorbelJsDir = process.cwd() + '/node_modules/corbel-js';

    if (grunt.file.isLink(dependencyCorbelJsDir)) {
        console.log('  Deleting link : ' + dependencyCorbelJsDir);
        fs.unlinkSync(dependencyCorbelJsDir);
    }
  }

  grunt.registerTask('delete-env-links', 'Deletes local corbel-js link.',
    deleteCorbelJsLink);
};
