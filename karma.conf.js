// Note some browser launchers should be installed before using karma start.

// For example:
//      $ npm install karma-firefox-launcher
//      $ karma start --browser=Firefox

// See http://karma-runner.github.io/0.8/config/configuration-file.html
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['qunit'],
    logLevel: config.LOG_INFO,
    port: 9876,

    // list of files / patterns to load in the browser
    files: [
      //'test/vendor/qunit-extras.js',
      'cache.js',
      'test/*.js'
    ],

    // Test results reporter to use
    // https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      // Ex: 'src/**/*.js': ['coverage']
      'cache.js': ['coverage']
    },

    coverageReporter: {
      type:   'lcov',
      dir:    'coverage/',
      subdir: '.'
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
