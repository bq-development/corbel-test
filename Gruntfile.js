'use strict';

var DEFAULT_CONCURRENT = 10;

function getKarmaConf(grunt) {
    var concurrent = grunt.option('concurrent') || DEFAULT_CONCURRENT;
    var content = {
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
            },
        }
    };

    for (var i = 0; i < concurrent; i++) {
        content['part' + i] = {
            singleRun: true,
            browsers: ['PhantomJS'],
            tapReporter: {
                    outputFile: '.report/report-' + i + '.tap',
                    disableStdout: true
            },
            client: {
                mocha: {
                    timeout: 120000
                }
            },
            options: {
                client: {
                    args: [{
                        index: i,
                        total: concurrent,
                        parallel: true
                    }],
                    env: grunt.option('env'),
                    localServices: grunt.option('local-services'),
                    grep: grunt.option('grep')
                }
            }
        };
    }
    return content;
}

function getParallelConf(grunt) {
    var concurrent = grunt.option('concurrent') || DEFAULT_CONCURRENT;
    var tasks = [];

    for (var i = 0; i < concurrent; i++) {
        tasks.push('karma:part' + i);
    }

    return {
        test: {
            options: {
                grunt: true,
                stream: true
            },
            tasks: tasks
        }
    };
}

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var randomPort = require('random-port');
    var _ = require('lodash');
    var PKG = require('./package.json');
    var PORTS = require('./test/ports.conf.js');
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
                    '.tmp/bundle.js': ['src/main.js', 'test/spec/private/utils/main.js',
                        'test/spec/private/utils/ec/common.js'
                    ]
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
                    fail: function() {
                        console.error('the server had not start');
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
        },
        parallel: getParallelConf(grunt),
        karma: getKarmaConf(grunt)
    });

    grunt.registerTask('express:random:port', function() {
        var done = this.async();
        randomPort({
            from: 20000,
            range: 10000
        }, function(port) {
            console.log('Express port ' + port);
            grunt.config.set('express', {
                options: {
                    background: true,
                    port: port
                },
                dev: {
                    options: {
                        script: 'express/server.js'
                    }
                }
            });
            done();
        });
    });

    grunt.registerTask('config', '', function() {
        var defaultConfig = grunt.file.readJSON('.corbeltest.default');
        var config = grunt.file.exists('.corbeltest') ? grunt.file.readJSON('.corbeltest') : {};
        var finalConfig = {};
        _.extend(finalConfig, defaultConfig, config);
        finalConfig.EXPRESS = grunt.config('express.options.port');
        grunt.file.write(CONFIG.tmp +
            '/config.js', 'module.exports = ' + JSON.stringify(finalConfig, null, 2));
    });

    grunt.registerTask('common', '', [
        'express:random:port',
        'config',
        'browserify',
        'express:dev'
    ]);


    grunt.registerTask('check', '', [
        'versioncheck',
        'clean',
        'jshint'
    ]);

    grunt.registerTask('serve:test', '', [
        'check',
        'common',
        'karma:serve',
        'waitServer',
        'open:test',
        'watch'
    ]);

    // deprecated
    grunt.registerTask('server:test', function() {
        grunt.log.error('>>> ATENTION: grunt server:test is deprecated, please use grunt serve:test');
        grunt.task.run(['serve:test']);
    });

    grunt.registerTask('ci-test', [
        'common',
        'karma:unit'
    ]);

    grunt.registerTask('test', [
        'check',
        'common',
        'karma:unit'
    ]);

    grunt.loadNpmTasks('grunt-parallel');
    grunt.loadNpmTasks('grunt-continue');

    grunt.registerTask('parallel:tests', [
        'common',
        'continue:on',
        'parallel:test',
        'continue:off'
    ]);

    grunt.registerTask('default', ['test']);

};
