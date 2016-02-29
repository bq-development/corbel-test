'use strict'

module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt)

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt)

  var _ = require('lodash')
  var PKG = require('./package.json')
  var PORTS = require('./test/ports.conf.js')
  var CONFIG = PKG.config || {}
  CONFIG.src = CONFIG.src || 'src'
  CONFIG.tmp = CONFIG.tmp || '.tmp'
  CONFIG.test = CONFIG.test || 'test'

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

    // Format all the code following standard js
    standard: {
      lint: {
        src: [
          './{express,src,test}/**/*.js',
          '*.js'
        ]
      },
      format: {
        options: {
          format: true,
          lint: true
        },
        src: [
          './{express,src,test}/**/*.js',
          '*.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      all: '<%= yeoman.tmp %>'
    },

    // Bundles for browser
    browserify: {
      dist: {
        files: {
          '.tmp/bundle.js': ['src/main.js', 'test/spec/private/utils/main.js']
        }
      }
    },

    // Test settings
    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        client: {
          mocha: {
            timeout: 90000
          },
          env: grunt.option('env'),
          localServices: grunt.option('local-services'),
          grep: grunt.option('grep')
        }
      },
      unit: {
        singleRun: true,
        browsers: [
          'PhantomJS'
        ]
      },
      serve: {
        singleRun: false,
        reporters: ['mocha'],
        background: true,
        client: {
          mocha: {
            reporter: 'html'
          }
        }
      }
    },
    express: {
      options: {
        // Override defaults here
        background: true,
        port: PORTS.EXPRESS
      },
      dev: {
        options: {
          script: 'express/server.js'
        }
      }
    },

    versioncheck: {
      options: {
        hideUpToDate: true
      }
    },
    waitServer: {
      server: {
        options: {
          req: 'http://localhost:' + PORTS.KARMA,
          fail: function () {
            console.error('the server had not start')
          },
          timeout: 20 * 1000,
          isforce: true,
          interval: 200,
          print: false
        }
      }
    },
    open: {
      test: {
        path: 'http://localhost:' + PORTS.KARMA + '/debug.html'
      }
    }
  })

  grunt.registerTask('config', '', function () {
    var defaultConfig = grunt.file.readJSON('.corbeltest.default')
    var config = grunt.file.exists('.corbeltest') ? grunt.file.readJSON('.corbeltest') : {}
    var finalConfig = {}
    _.extend(finalConfig, defaultConfig, config)
    grunt.file.write(CONFIG.tmp +
      '/config.js', 'module.exports = ' + JSON.stringify(finalConfig, null, 2))
  })

  grunt.registerTask('common', '', [
    'versioncheck',
    'clean',
    'standard:format',
    'config',
    'browserify',
    'express:dev'
  ])

  grunt.registerTask('serve:test', '', [
    'common',
    'karma:serve',
    'waitServer',
    'open:test',
    'watch'
  ])
  // deprecated
  grunt.registerTask('server:test', function () {
    grunt.log.error('>>> ATENTION: grunt server:test is deprecated, please use grunt serve:test')
    grunt.task.run(['serve:test'])
  })

  grunt.registerTask('test', [
    'common',
    'karma:unit'
  ])

  grunt.registerTask('default', ['test'])
}
