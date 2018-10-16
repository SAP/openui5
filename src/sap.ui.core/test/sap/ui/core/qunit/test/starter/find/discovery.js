/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

/*eslint-env es6*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(Log, jQuery) {
	"use strict";

	function findPages(sEntryPage, progressCallback) {

		function checkTestPage(sTestPage) {

			return new Promise(function(resolve, reject) {

				// console.log("checking test page: " + sTestPage);
				let url = new URL(sTestPage, location.href);
				if ( !/testsuite\./.test(url.pathname) ) {
					resolve({name: sTestPage});
					return;
				}

				if ( progressCallback ) {
					progressCallback(sTestPage);
				}

				// check for an existing test page and check for test suite or page
				jQuery.get(sTestPage).done(function(sData) {
					if (/(?:window\.suite\s*=|function\s*suite\s*\(\s*\)\s*{)/.test(sData)
							|| (/data-sap-ui-testsuite/.test(sData) && !/sap\/ui\/test\/starter\/run-test/.test(sData)) ) {

						// console.log("execute page ", sTestPage);
						var $frame = jQuery("<iframe>");

						var onSuiteReady = function onSuiteReady(oIFrame) {
							findTestPages(oIFrame).then(function(aTests) {
								$frame.remove();
								resolve({
									name: sTestPage,
									tests: aTests,
									simple: aTests.every((test) => !test.suite)
								});
							}, function(oError) {
								Log.error("failed to load page '" + sTestPage + "'");
								$frame.remove();
								resolve( { name: sTestPage, error: oError } );
							});
						};

						$frame.css("display", "none");
						$frame.one("load", function() {
							if (typeof this.contentWindow.suite === "function") {
								onSuiteReady(this);
							} else {
								// Wait for a CustomEvent in case window.suite isn't defined, yet
								this.contentWindow.addEventListener("sap-ui-testsuite-ready", function() {
									onSuiteReady(this);
								}.bind(this));
							}
						});
						let url = new URL(sTestPage, document.baseURI);
						url.searchParams.set("sap-ui-xx-noless","true");
						$frame.attr("src", url);
						$frame.appendTo(document.body);
					} else {
						resolve({ name: sTestPage });
					}
				}).fail(function(xhr,status,msg) {
					var text = (xhr ? xhr.status + " " : "") + (msg || status || 'unspecified error');
					Log.error("Failed to load page '" + sTestPage + "': " + text);
					resolve({name: sTestPage, error: text});
				});

			});

		}

		function sequence(aPages) {
			// console.log("before sequence:", aPages);
			return aPages.reduce( (lastPromise, page) => {
				return lastPromise.then( (lastResult) => {
					return checkTestPage(page).then( (pageResult) => {
						lastResult.push(pageResult);
						return lastResult;
					});
				});
			}, Promise.resolve([])).then( (a) => {
				// console.log("after sequence:", a);
				return a;
			});
		}

		/* function parallel(aPages) {
			return Promise.all( aPages.map( (page) => checkTestPage(page) ) );
		} */

		function findTestPages(oIFrame) {
			return Promise.resolve(oIFrame.contentWindow.suite()).
				then( (oSuite) => (oSuite && oSuite.getTestPages() || []) ).
				then( (aPages) => sequence(aPages) ).
				catch( () => [] );
		}

		return checkTestPage(sEntryPage);
	}

	return {
		findTestsuites: function(sEntryPage, progressCallback) {
			return findPages(sEntryPage, progressCallback).then( (result) => {
				let allSuites = [];
				function collect(test) {
					if ( Array.isArray(test.tests) ) {
						test.tests.forEach(collect);
						if ( test.simple ) {
							allSuites.push(test.name);
						}
					}
				}
				collect(result);
				return allSuites;
			});
		},
		findTests: function(entryPage, progressCallback) {
			return findPages(entryPage, progressCallback).then( (result) => {
				let allTests = [];
				function collect(test) {
					if ( Array.isArray(test.tests) ) {
						test.tests.forEach(collect);
					} else {
						allTests.push(test.name);
					}
				}
				collect(result);
				return allTests;
			});
		}
	};

});
