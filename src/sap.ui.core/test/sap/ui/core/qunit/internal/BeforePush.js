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

	// 'full': full mode only
	// 'integration': integration test mode only
	// everything else: full & integration test mode
	var mTests = {
		'qunit/analytics/testsuite4analytics.qunit.html?hidepassed' : 'full',
		'qunit/internal/AnnotationParser.qunit.html?hidepassed&coverage' : 'full',
		'qunit/internal/1Ring.qunit.html?hidepassed&coverage&realOData=true' : 'full',
		'qunit/internal/ODataV4.qunit.html?module=sap.ui.model.odata.v4.ODataModel.integration&hidepassed&coverage' : 'integration',
		'demokit/sample/odata/v4/ListBinding/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/ListBinding/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/ListBindingTemplate/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/ListBindingTemplate/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/SalesOrdersRTATest/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/SalesOrderTP100_V2/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrderTP100_V4/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/ViewTemplate/scenario/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/ViewTemplate/types/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/ViewTemplate/types/Opa.qunit.html?realOData=true' : 'both'
	};

	// returns an array of tests according to the given flags
	function filterTests(bIntegration, bRealOData) {
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
		if (!bRealOData) {
			// remove the query property "realOData" at each URL; remove duplicates
			aTests.forEach(function (sUrl) {
				mFilter[sUrl.replace(/realOData=true(&|$)/, "").replace(/[?&]$/, "")] = true;
			});
			aTests = Object.keys(mFilter);
		}
		return aTests;
	}

	function runTests(bRealOData) {
		var oActiveFrame,
			oFinished,
			oFirstFailedTest,
			oSelectedTest,
			iStart = Date.now(),
			aTests = filterTests(/integrationTestsOnly/i.test(location.href), bRealOData);

		function createTest(sText, sUrl) {
			var oTest = {
					element : document.createElement("li"),
					failed : 0,
					total : 0,
					url : sUrl
				},
				oDiv = document.createElement("div"),
				oText = document.createTextNode(sText);

			oTest.element.appendChild(oDiv);
			oDiv.addEventListener("click", select.bind(null, oTest));
			oDiv.appendChild(oText);
			document.getElementById("results").appendChild(oTest.element);
			return oTest;
		}

		function newActiveFrame() {
			if (oActiveFrame) {
				oActiveFrame.classList.add("hidden");
			}
			oActiveFrame = document.createElement("iframe");
			oActiveFrame.setAttribute("height", "900");
			oActiveFrame.setAttribute("width", "1600");
			document.body.appendChild(oActiveFrame);
		}

		function next() {
			if (aTests.length) {
				return runTest(aTests.shift());
			} else {
				oFinished.element.classList.remove("hidden");
				start(oFinished);
				summary(oFinished, oFinished.total, oFinished.failed, Date.now() - iStart);
				if (oFirstFailedTest) {
					select(oFirstFailedTest);
				}
			}
		}

		function runTest(oTest) {
			function onLoad() {
				oActiveFrame.removeEventListener("load", onLoad);
				oActiveFrame.contentWindow.QUnit.done(function (oDetails) {

					stop(oTest, oDetails);
					if (oDetails.failed) {
						oFirstFailedTest = oFirstFailedTest || oTest;
						newActiveFrame();
					}
					next();
				});
			}

			start(oTest);
			oActiveFrame.addEventListener("load", onLoad);
		}

		function select(oTest) {
			if (oTest.frame) {
				if (oSelectedTest) {
					oSelectedTest.element.classList.remove("selected");
					if (oSelectedTest.frame && oSelectedTest.frame !== oTest.frame) {
						oSelectedTest.frame.classList.add("hidden");
						oTest.frame.classList.remove("hidden");
					}
				}
				oSelectedTest = oTest;
				oTest.element.classList.add("selected");
			}
		}

		function start(oTest) {
			oTest.frame = oActiveFrame;
			select(oTest);
			oActiveFrame.src = oTest.url || "about:blank";
			oTest.element.firstChild.classList.add("running");
		}

		function stop(oTest, oDetails) {
			summary(oTest, oDetails.total, oDetails.failed, oDetails.runtime);
			oTest.element.firstChild.classList.remove("running");
			oFinished.failed += oDetails.failed;
			oFinished.total += oDetails.total;
			if (oDetails.failed) {
				oTest.element.firstChild.classList.add("failed");
			} else {
				oTest.frame = undefined;
			}
		}

		function summary(oTest, iTotal, iFailed, iRuntime) {
			var oElement = document.createElement("a"),
				sText = ": " + iTotal + " tests in " + Math.floor(iRuntime / 1000.0 + 0.5)
					+ " seconds" + (iFailed ? ", " + iFailed + " failed" : "") + " ";

			oTest.element.appendChild(document.createTextNode(sText));

			if (oTest.url) {
				oElement.setAttribute("href", oTest.url);
				oElement.setAttribute("target", "_blank");
				oElement.appendChild(document.createTextNode("Rerun"));
				oTest.element.appendChild(oElement);
			}
		}

		setStatus();
		document.getElementById("buttons").classList.add("hidden");
		aTests = aTests.map(function (sUrl) {
			return createTest(sUrl, "../../" + sUrl);
		});
		oFinished = createTest("Finished");
		oFinished.element.classList.add("hidden");
		newActiveFrame();
		next();
	}

	function setStatus(sText) {
		var oElement = document.getElementById("status");

		if (oElement.firstChild) {
			oElement.removeChild(oElement.firstChild);
		}
		if (sText) {
			oElement.appendChild(document.createTextNode(sText));
		}
	}

	// For the onload handler and the button "Run"
	function verifyConnectionAndRun() {
		var oLoginRequest = new XMLHttpRequest();

		// send a request to the service document from the v4 sample service to ensure that
		// the credentials are known before running the test suite.
		oLoginRequest.open("GET", "../../../../../../proxy/sap/opu/odata4/sap/zui5_testv4/default/"
			+ "sap/zui5_epm_sample/0002/");
		oLoginRequest.addEventListener("load", function () {
			if (oLoginRequest.status === 200) {
				runTests(true);
			} else {
				setStatus("Could not access the real OData server: "
					+ oLoginRequest.status + " " + oLoginRequest.statusText);
			}
		});
		oLoginRequest.send();
	}

	window.addEventListener("load", function () {
		document.getElementById("run").addEventListener("click", verifyConnectionAndRun);
		document.getElementById("runWithoutRealOData")
			.addEventListener("click", runTests.bind(null, false));
		verifyConnectionAndRun();
	});
}());
