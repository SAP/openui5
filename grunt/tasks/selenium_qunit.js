/*
 * grunt-selenium-qunit
 *
 *
 * Copyright (c) 2014-2020 SAP SE
 */

'use strict';

var path = require('path');
var webdriver = require('selenium-webdriver');
var async = require('async');
var multiline = require('multiline');
var prettyMs = require('pretty-ms');

var testResourcesPattern = /.*test-resources\/(.*)/;

var resultScript = multiline(function(){/*

if (window._$jUnitReport) {
	return {
		ready: !!window._$jUnitReport.results,
		results: window._$jUnitReport.results,
		xml: window._$jUnitReport.xml,
		tests: window._$jUnitReport.tests
	};
} else {
	var oResult = document.getElementById("qunit-testresult");
	var bReady = !!(oResult && oResult.innerHTML && oResult.innerHTML.indexOf("completed") !== -1);
	var aTests;
	var mResults = {};

	if (bReady) {

		var aRuntime = /[0-9]+/.exec(oResult.innerText);
		if (aRuntime) {
			mResults.runtime = parseInt(aRuntime[0], 10);
		}

		var aTotal = oResult.getElementsByClassName('total');
		if (aTotal.length > 0) {
			mResults.total = parseInt(aTotal[0].innerText, 10);
		}

		var aPassed = oResult.getElementsByClassName('passed');
		if (aPassed.length > 0) {
			mResults.passed = parseInt(aPassed[0].innerText, 10);
		}

		var aFailed = oResult.getElementsByClassName('failed');
		if (aFailed.length > 0) {
			mResults.failed = parseInt(aFailed[0].innerText, 10);
		}

		aTests = jQuery("#qunit-tests ol li").map(function() {
			var $el = jQuery(this);
			return {
				text: jQuery('span', $el).text() + '\n' +
					jQuery('tr', $el).map(function() { return jQuery(this).text(); }).get().join('\n'),
				pass: $el.hasClass('pass')
			};
		}).get();

	}

	return { ready: bReady, tests: aTests, results: mResults };
}

*/});

module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('selenium_qunit', 'Grunt task to run QUnit test-pages using selenium', function() {
		var done = this.async();

		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			browsers: [ 'firefox' ],
			baseUrl: 'http://localhost:8080',
			contextPath: '/testsuite',
			testPages: ['/test-resources/qunit/testsuite.qunit.html'],
			reportsDir: 'surefire-reports'
		});

		// convert string options to arrays
		if (typeof options.testPages === 'string') {
			options.testPages = [ options.testPages ];
		}
		if (typeof options.browsers === 'string') {
			options.browsers = [ options.browsers ];
		}

		// check if at least one browser/testPage was set
		if (!options.browsers || options.browsers.length === 0) {
			var e = new Error('No browser specified!');
			grunt.log.error(e);
			done(e);
			return;
		}
		if (!options.testPages || options.testPages.length === 0) {
			var e = new Error('No testPage specified!');
			grunt.log.error(e);
			done(e);
			return;
		}

		// loop over all browsers
		async.concatSeries(options.browsers, function(browser, nextBrowser) {

			grunt.log.subhead(browser);

			// create capabilities
			var desiredCapabilities = webdriver.Capabilities[browser]();

			// set custom capabilities (TODO: add option to pass in capabilities)
			if (browser === 'chrome') {
				desiredCapabilities.set('chromeOptions', {
					args: [
						'start-maximized', 'test-type'
					]
				});
			}

			// to collect all test results for current browser
			var testResults = [];

			// create new driver
			var driver = new webdriver.Builder().
			withCapabilities(desiredCapabilities).build();

			// set async script timeout
			driver.manage().timeouts().setScriptTimeout(30000).then(function() {

				driver.getCapabilities().then(function(capabilities) {

					// used as testsuite prefix for reporting
					var browserInfoString = browser + '.' + capabilities.get('version').replace(/\./g, '_');

					console.log(options.baseUrl + options.contextPath + '/test-resources/sap/ui/qunit/testrunner.html');
					driver.get(options.baseUrl + options.contextPath + '/test-resources/sap/ui/qunit/testrunner.html').then(function() {

						// run discovery with all testPages
						async.concatSeries(options.testPages, function(discoveryTestPage, nextDiscoveryTestPage) {

							driver.executeAsyncScript(
								'sap.ui.qunit.TestRunner.checkTestPage("' + options.contextPath + '" + arguments[0]).done(arguments[arguments.length - 1]);',
								discoveryTestPage
							).then(function(response) {

								var aTests = [];

								if (response) {
									response.forEach(function(testPage) {
										var testName = testPage;
										var match = testResourcesPattern.exec(testName);
										if (match) {
											testName = match[1];
										}
										aTests.push({
											url: testPage,
											name: testName
										});
									});
								}

								nextDiscoveryTestPage(null, aTests);

							});
						}, function(err, aResults) {

							// convert array with arrays to one array
							// e.g. [ [ 'foo' ], [ 'bar', 'baz' ] ] -> [ 'foo', 'bar', 'baz' ]
							var aTests = Array.prototype.concat.apply([], aResults);

							async.concatSeries(aTests, function(oTest, nextTest) {

								grunt.log.writeln();
								grunt.log.writeln(options.baseUrl + oTest.url);

								driver.get(options.baseUrl + oTest.url).then(function() {
									var finished = false;

									async.doUntil(function(callback) {
										driver.executeScript(resultScript).then(function(response) {
											finished = response.ready;

											if (!finished) {
												setTimeout(callback, 200);
												return;
											}

											// add results to global array
											testResults.push(response);

											if (response.xml) {
												var testsuiteName = oTest.url.replace(/[\/:*?\"<>|]/g, '.');
												if (testsuiteName.substr(0, 1) === '.') {
													testsuiteName = testsuiteName.substr(1);
												}
												var xmlFileName = 'TEST-' + browserInfoString + '.' + testsuiteName + '.xml';
												var xmlPath = path.join(options.reportsDir, xmlFileName);

												// prepend browser info (name + version) in testsuite names
												response.xml = response.xml.replace(/<testsuite (.*) name="([^"]*)"/g, '<testsuite $1 name="' + browserInfoString + '.$2"');

												grunt.file.write(xmlPath, response.xml);
											} else {
												// TODO: create xml report using parsed dom content? re-use qunit-junit-reporter lib?
												grunt.log.error('No surefire-report XML received!');
												grunt.log.writeln();
											}

											if (response.results) {

												var status;
												if (response.results.failed > 0) {
													status = 'error';
												} else {
													status = 'ok';
												}

												var text = 'Took ' + prettyMs(response.results.runtime) + ' (' +
													response.results.passed + ' passed, ' + response.results.failed + ' failed)';

												grunt.log[status](text);

												if (status === 'error') {
													if (response.tests) {
														response.tests.filter(function(test) {
															return !test.pass;
														}).forEach(function(test) {
															grunt.log.writeln();
															grunt.log.errorlns(test.text);
														});
													} else {
														grunt.log.writeln();
														grunt.log.errorlns('There were test failures, but detailed test results could not be retrieved!');
													}
												}

											} else {
												grunt.log.error('No result information received!');
											}

											callback();
										});
									}, function() {
										return finished;
									}, nextTest);
								});
							}, function(err) {

								var currentResults = {
									passed: 0,
									failed: 0,
									runtime: 0
								};

								testResults.forEach(function(testResult) {
									if (testResult.results) {
										currentResults.passed += testResult.results.passed;
										currentResults.failed += testResult.results.failed;
										currentResults.runtime += testResult.results.runtime;
									}
								});

								grunt.log.writeln();

								var status;
								if (currentResults.failed > 0) {
									status = 'error';
								} else {
									status = 'ok';
								}

								grunt.log[status](
									'Finished tests on ' + browser + '. All tests took ' + prettyMs(currentResults.runtime) + ' (' +
									currentResults.passed + ' passed, ' + currentResults.failed + ' failed)'
								);

								grunt.log.writeln();

								driver.quit().then(function() {
									nextBrowser(err, testResults);
								});
							});
						});
					});
				});
			});
		}, function(err, allTestResults) {

			var overallResults = {
				passed: 0,
				failed: 0,
				runtime: 0
			};

			allTestResults.forEach(function(testResult) {
				if (testResult.results) {
					overallResults.passed += testResult.results.passed;
					overallResults.failed += testResult.results.failed;
					overallResults.runtime += testResult.results.runtime;
				}
			});

			grunt.log.writeln();

			var status;
			if (overallResults.failed > 0) {
				status = 'error';
			} else {
				status = 'ok';
			}

			grunt.log[status](
				'Finished tests on all browsers. All tests took ' + prettyMs(overallResults.runtime) + ' (' +
				overallResults.passed + ' passed, ' + overallResults.failed + ' failed)'
			);

			done();
		});

	});

};
