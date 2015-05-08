
var browsers = {
  "CHROME_V26": {"base": "SauceLabs", "browserName": "chrome", "version": "26" },
  "CHROME_V35": {"base": "SauceLabs", "browserName": "chrome", "version": "35"},
  "CHROME_V40": {"base": "SauceLabs", "browserName": "chrome", "version": "40"},

  "FF_V3.6": {"base": "SauceLabs", "browserName": "firefox", "version": "3.6" },
  "FF_V4":   {"base": "SauceLabs", "browserName": "firefox", "version": "4" },
  "FF_V11":  {"base": "SauceLabs", "browserName": "firefox", "version": "11"},
  "FF_V35":  {"base": "SauceLabs", "browserName": "firefox", "version": "35"},

  "SAFARI_V5": {"base": "SauceLabs", "browserName": "safari", "version": "5"},
  "SAFARI_V6": {"base": "SauceLabs", "browserName": "safari", "version": "6"},
  "SAFARI_V7": {"base": "SauceLabs", "browserName": "safari", "version": "7"},
  "SAFARI_V8": {"base": "SauceLabs", "browserName": "safari", "version": "8"},

  "OPERA_V11": {"base": "SauceLabs", "browserName": "opera", "version": "11"},
  "OPERA_V12": {"base": "SauceLabs", "browserName": "opera", "version": "12"},

  //"IE_V6":  {"base": "SauceLabs", "browserName": "internet explorer", "version": "6",  "platform": "Windows XP" },
  "IE_V7":  {"base": "SauceLabs", "browserName": "internet explorer", "version": "7",  "platform": "Windows XP" },
  "IE_V8":  {"base": "SauceLabs", "browserName": "internet explorer", "version": "8",  "platform": "Windows XP"  },
  "IE_V9":  {"base": "SauceLabs", "browserName": "internet explorer", "version": "9",  "platform": "Windows 7"  },
  "IE_V10": {"base": "SauceLabs", "browserName": "internet explorer", "version": "10", "platform": "Windows 8"  },
  "IE_V11": {"base": "SauceLabs", "browserName": "internet explorer", "version": "11", "platform": "Windows 8.1"},

  "ANDROID_V4":   {"base": "SauceLabs", "browserName": "android", "version": "4.0"}
};

module.exports = function(config) {
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('Sauce environments not set --- Skipping');
    return process.exit(0);
  }
  config.set({
    basePath: '',
    frameworks: ['qunit'],
    singleRun: true,
    // list of files / patterns to load in the browser
    files: [
      'cache.js',
      'test/*.js'
    ],
    // test results reporter to use
    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      startConnect: true,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },
    transports: ['xhr-polling'],
    captureTimeout: 120000,
    customLaunchers: browsers
    //browsers: Object.keys(browsers)
  });
};

