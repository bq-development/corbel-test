'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var _ = require('lodash');
    var PKG = require('./package.json');
    var PORTS = require('./test/ports.conf.js');
    var CONFIG = PKG.config || {};
    CONFIG.src = CONFIG.src || 'src';
    CONFIG.tmp = CONFIG.tmp || '.tmp';
    CONFIG.test = CONFIG.test || 'test';

    // Define the configuration for all the tasks
    grunt.initConfig({

        parallel: {
            test: {
                options: {
                    grunt: true,
                    stream: true
                },
                tasks: [
                    'karma:iam',
                    'karma:assets',
                    'karma:engine',
                    'karma:evci',
                    'karma:notifications',
                    'karma:oauth',
                    'karma:corbeljs',
                    'karma:resources',
                    'karma:scheduler',
                    'karma:webfs',
                    'karma:ingestion',
                    'karma:ec',
                    'karma:eventbus',
                    'karma:rules'
                ]
            }
        },

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
                        'test/spec/private/utils/ec/common.js']
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
            },
            iam: {
                singleRun: true,
                htmlReporter: {
                    reportName: 'report-summary-iam'
                },
                tapReporter: {
                    outputFile: '.report/report-iam.tap',
                    disableStdout: true
                },
                browsers: ['PhantomJS'],
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In IAM module']
                    }
                }
            },
            assets: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-assets'
                },
                tapReporter: {
                    outputFile: '.report/report-assets.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In ASSETS module']
                    }
                }
            },
            engine: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-engine'
                },
                tapReporter: {
                    outputFile: '.report/report-engine.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In ENGINE silkroad modules']
                    }
                }
            },
            evci: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-evci'
                },
                tapReporter: {
                    outputFile: '.report/report-evci.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In EVCI module']
                    }
                }
            },
            notifications: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-notifications'
                },
                tapReporter: {
                    outputFile: '.report/report-notifications.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In NOTIFICATIONS module']
                    }
                }
            },
            oauth: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-oauth'
                },
                tapReporter: {
                    outputFile: '.report/report-oauth.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In OAUTH module']
                    }
                }
            },
            corbeljs: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-corbeljs'
                },
                tapReporter: {
                    outputFile: '.report/report-corbeljs.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In CORBELJS module']
                    }
                }
            },
            resources: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-resources'
                },
                tapReporter: {
                    outputFile: '.report/report-resources.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In RESOURCES module']
                    }
                }
            },
            scheduler: {
                singleRun: true,
                htmlReporter: {
                    reportName: 'report-summary-scheduler'
                },
                tapReporter: {
                    outputFile: '.report/report-scheduler.tap',
                    disableStdout: true
                },
                browsers: ['PhantomJS'],
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In SCHEDULER module']
                    }
                }
            },
            webfs: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-webfs'
                },
                tapReporter: {
                    outputFile: '.report/report-webfs.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In WEBFS module']
                    }
                }
            },
            ingestion: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-ingestion'
                },
                tapReporter: {
                    outputFile: '.report/report-ingestion.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In INGESTION module']
                    }
                }
            },
            bqpon: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-bqpon'
                },
                tapReporter: {
                    outputFile: '.report/report-bqpon.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In BQPON module']
                    }
                }
            },
            ec: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-ec'
                },
                tapReporter: {
                    outputFile: '.report/report-ec.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In EC module']
                    }
                }
            },
            eventbus: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-eventbus'
                },
                tapReporter: {
                    outputFile: '.report/report-eventbus.tap',
                    disableStdout: true
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In EVENTBUS module']
                    }
                }
            },
            rules: {
                singleRun: true,
                browsers: ['PhantomJS'],
                htmlReporter: {
                    reportName: 'report-summary-rules'
                },
                client: {
                    mocha: {
                        timeout: 120000
                    }
                },
                options: {
                    client: {
                        args: ['--grep=In RULES module']
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
        }
    });

    grunt.registerTask('config', '', function () {
        var defaultConfig = grunt.file.readJSON('.corbeltest.default');
        var config = grunt.file.exists('.corbeltest') ? grunt.file.readJSON('.corbeltest') : {};
        var finalConfig = {};
        _.extend(finalConfig, defaultConfig, config);
        grunt.file.write(CONFIG.tmp +
            '/config.js', 'module.exports = ' + JSON.stringify(finalConfig, null, 2));
    });

    grunt.registerTask('ci-common', '', [
        'config',
        'browserify',
        'express:dev'
    ]);

    grunt.registerTask('common', '', [
        'versioncheck',
        'clean',
        'jshint',
        'config',
        'browserify',
        'express:dev'
    ]);

    grunt.registerTask('serve:test', '', [
        'common',
        'karma:serve',
        'waitServer',
        'open:test',
        'watch'
    ]);

    // deprecated
    grunt.registerTask('server:test', function () {
        grunt.log.error('>>> ATENTION: grunt server:test is deprecated, please use grunt serve:test');
        grunt.task.run(['serve:test']);
    });

    grunt.registerTask('ci-test', [
        'ci-common',
        'karma:unit'
    ]);

    grunt.registerTask('test', [
        'common',
        'karma:unit'
    ]);

    grunt.loadNpmTasks('grunt-parallel');

    grunt.registerTask('parallel:tests', [
        'common',
        'parallel:test'
    ]);

    grunt.registerTask('default', ['test']);

};
