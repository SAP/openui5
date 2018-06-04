/*!
 * ${copyright}
 */
/*
  Test page that runs all (QUnit and OPA) tests of the UI services team within an inline frame.

  The page has two modes. As a default ("full mode") it runs all tests. For 1Ring.qunit.html the
  test coverage is measured. A coverage of 100% is expected.

  With "#integrationTestsOnly", only the OPA tests and ODataModel.integration.qunit.html (which is
  part of 1Ring in full mode) are run. Coverage is measured for all tests, but no specific coverage
  is expected. This mode can be used to see which code is actually tested via integration tests. It
  can also be used to verify a POC.

  Many of our tests can (and will) be run with "realOData=true" and perform tests against a
  back-end server using the SimpleProxy servlet. Before running any tests, this page checks that
  this server can be accessed and asks for basic authentication, so that the tests themselves later
  run through without login popups. If this fails, the tests with "realOData=true" can be skipped.
*/
(function () {
	"use strict";
	/*global alert */
	/* eslint-disable no-alert */

	var sBase = "../../../../../../",
		// 'full': full mode only
		// 'integration': integration test mode only
		// everything else: full & integration test mode
		mTests = {
			'qunit/analytics/testsuite4analytics.qunit.html' : 'full',
			'qunit/internal/AnnotationParser.qunit.html' : 'full',
			'qunit/internal/1Ring.qunit.html?sap-ui-debug=true&hidepassed&coverage&sap-ui-logLevel=ERROR&realOData=true' : 'full',
			'qunit/odata/v4/ODataModel.integration.qunit.html?sap-ui-debug=true&hidepassed&coverage&sap-ui-logLevel=ERROR' : 'integration',
			'demokit/sample/odata/v4/ListBinding/Opa.qunit.html' : 'both',
			'demokit/sample/odata/v4/ListBinding/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html' : 'both',
			'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html' : 'both',
			'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/SalesOrderTP100_V2/Opa.qunit.html' : 'both',
			'demokit/sample/odata/v4/SalesOrderTP100_V4/Opa.qunit.html' : 'both',
			'demokit/sample/ViewTemplate/scenario/Opa.qunit.html' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?realOData=true' : 'both'
		};

	// returns an array of tests according to the given flags
	function filterTests(bIntegration, bNoRealOData) {
		var sUnwanted = bIntegration ? "full" : "integration",
			aTests,
			mFilter = {};

		aTests = Object.keys(mTests).filter(function (sUrl) {
			return mTests[sUrl] !== sUnwanted;
		});
		if (bIntegration) {
			// ensure that each URL has the query property "coverage"
			aTests = aTests.map(function (sUrl) {
				if (sUrl.indexOf("coverage") < 0) {
					sUrl = sUrl + (sUrl.indexOf("?") < 0 ? "?" : "&") + "coverage";
				}
				return sUrl;
			});
		}
		if (bNoRealOData) {
			// remove the query property "realOData" at each URL; remove duplicates
			aTests.forEach(function (sUrl) {
				mFilter[sUrl.replace(/[?&]realOData=true/, "")] = true;
			});
			aTests = Object.keys(mFilter);
		}
		return aTests;
	}

	// For the onload handler and the button "Run"
	function run() {
		var oLoginRequest = new XMLHttpRequest();

		// send a request to the service document from the v4 sample service to ensure that
		// the credentials are known before running the test suite.
		oLoginRequest.open("GET", sBase + "proxy/sap/opu/odata4/sap/zui5_testv4/default/"
			+ "sap/zui5_epm_sample/0002/");
		oLoginRequest.addEventListener("load", function () {
			if (oLoginRequest.status === 200) {
				runTests(false);
			} else {
				alert("Could not access the real OData server: "
					+ oLoginRequest.status + " " + oLoginRequest.statusText);
			}
		});
		oLoginRequest.send();
	}

	function runTests(bNoRealOData) {
		var oIFrame = document.getElementById("frame"),
			oResults = document.getElementById("results"),
			iStart = Date.now(),
			aTests = filterTests(
				/integrationTestsOnly/i.test(location.href),
				bNoRealOData);

		function log(sText, bReplace) {
			var oListItem = bReplace
				? oResults.lastChild
				: document.createElement("li");

			oListItem.innerHTML = sText;
			oResults.appendChild(oListItem);
		}

		function next() {
			if (aTests.length) {
				return runTest(aTests.shift(), next);
			} else {
				log("<b>Finished</b> in "
					+ Math.floor((Date.now() - iStart) / 1000.0 + 0.5) + " seconds");
				oIFrame.src = "about:blank";
			}
		}

		function runTest(sTest, fnSuccess) {
			function onLoad() {
				oIFrame.removeEventListener("load", onLoad);
				oIFrame.contentWindow.QUnit.done(function (oDetails) {

					log("Done with <b>" + sTest + "</b>. "
						+ oDetails.total + " tests completed in "
						+ Math.floor(oDetails.runtime / 1000.0 + 0.5)
						+ " seconds, with " + oDetails.failed + " failed", true);
					if (oDetails.failed) {
						throw new Error(oDetails.failed + " tests have failed!");
					} else {
						fnSuccess();
					}
				});
			}

			log("Running <b>" + sTest + "</b>...");
			oIFrame.src = "../../" + sTest;
			oIFrame.addEventListener("load", onLoad);
		}

		next();
	}

	window.addEventListener("load", function () {
		document.getElementById("run").addEventListener("click", run);
		document.getElementById("runWithoutRealOData")
			.addEventListener("click", runTests.bind(null, true));
		run();
	});
}());
