/*!
 * ${copyright}
 */
/*
  Test page that runs all (QUnit and OPA) tests of the UI services team within a hidden inline
  frame (well, not actually hidden, but out of sight).

  The page has two modes. As a default ("full mode") it runs all tests. For 1Ring.qunit.html the
  test coverage is measured. A coverage of 100% is expected.

  With "integrationTestsOnly", only the OPA tests and ODataModel.integration.qunit.html (which is
  part of 1Ring in full mode) are run. Coverage is measured for all tests, but no specific coverage
  is expected. This mode can be used to see which code is actually tested via integration tests. It
  can also be used to verify a POC (probably in combination with realOData=true to overcome
  "No Mockdata found" errors)

  Many of our tests can (and will) be run with "realOData=true" and perform tests against a back-end
  server using the SimpleProxy servlet. If BeforePush is called w/o realOData URL parameter, this
  page checks that this server can be accessed and asks for basic authentication, so that the tests
  themselves later run through without login popups. If this fails, the tests with "realOData=true"
  can be skipped.

  With "realOData=true" run only tests having "realOData=true" in URL.
  With "realOData=false" run all tests with stripped off "realOData=true".

  With "frames=n" you can run several tests in parallel to speed it up. When running only the
  verification "frames=4" seems a valid option in Chrome and Firefox. In IE and Edge you should not
  use this option. When testing with multiple browsers at once, it is better to run only one frame
  in each browser. When "frames=n" is given, all tests are run invisible.

  BeforePush expects all tests to use QUnit 2.
*/
(function () {
	"use strict";

	// 'full': full mode only
	// 'integration': integration test mode only
	// everything else: full & integration test mode
	var mTests = {
		'qunit/internal/AnnotationParser.qunit.html?hidepassed&coverage' : 'full',
		'qunit/internal/1Ring.qunit.html?hidepassed&coverage&realOData=true' : 'full',
		'qunit/internal/1Ring.qunit.html?hidepassed&coverage&realOData=true&module=sap.ui.model.odata.v4.ODataModel.integration' : 'integration',
		'demokit/sample/odata/v4/LateProperties/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/LateProperties/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/ListBinding/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/ListBinding/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/ListBindingTemplate/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/ListBindingTemplate/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/Products/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/SalesOrdersRTATest/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/SalesOrderTP100_V2/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/SalesOrderTP100_V4/Opa.qunit.html?supportAssistant=true' : 'both',
		'demokit/sample/odata/v4/ServerDrivenPaging/Opa.qunit.html' : 'both',
		'demokit/sample/odata/v4/ServerDrivenPaging/Opa.qunit.html?realOData=true' : 'both',
		'demokit/sample/odata/v4/Sticky/Opa.qunit.html?supportAssistant=true' : 'both',
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
		if (bRealOData === false) {
			// remove the query property "realOData" at each URL; remove duplicates
			aTests.forEach(function (sUrl) {
				var sTest = sUrl.replace(/\?.*$/, ""); // the URL w/o query parameters

				if (!mFilter[sTest]) {
					mFilter[sTest] = sUrl.replace(/realOData=true(&|$)/, "").replace(/[?&]$/, "");
				}
			});
			aTests = Object.keys(mFilter).map(function (sTest) {
				return mFilter[sTest];
			});
		} else if (bRealOData === true) {
			aTests = aTests.filter(function (sTest) {
				return /realOData=true/.test(sTest);
			});
		}
		return aTests;
	}

	function getFrameCount() {
		var iCount,
			aMatches = /[?&]frames=(\d+)(&|$)/.exec(location.search);

		if (!aMatches) {
			return 0;
		}
		iCount = parseInt(aMatches[1]);
		if (iCount < 1 || iCount > 4) {
			setStatus("Frames set to 1. Use 1 up to 4 frames.");
			iCount = 1;
		}
		return iCount;
	}

	/**
	 * Runs the tests.
	 *
	 * @param {boolean} [bRealOData]
	 *   if undefined, run all tests; if true, run only tests with "realOData=true"; if false, run
	 *   all tests without realOData (it is stripped off)
	 */
	function runTests(bRealOData) {
		var oFirstFailedTest,
			iFrames,
			iRunningTests = 0,
			oSelectedTest,
			iStart = Date.now(),
			aTests = filterTests(/integrationTestsOnly/i.test(location.href), bRealOData),
			iTop = 10000,
			oTotal,
			bVisible;

		function createTest(sText, sUrl) {
			var oTest = {
					element : document.createElement("li"),
					url : sUrl
				},
				oDiv = document.createElement("div"),
				oText = document.createTextNode(sText);

			oTest.element.appendChild(oDiv);
			oDiv.addEventListener("click", select.bind(null, oTest));
			oDiv.appendChild(oText);
			oTest.infoNode = document.createTextNode("");
			oTest.element.appendChild(oTest.infoNode);
			document.getElementById("results").appendChild(oTest.element);
			return oTest;
		}

		// starts another test or shows the summary
		function next() {
			if (aTests.length) {
				return runTest(aTests.shift());
			} else if (!iRunningTests) {
				oTotal.element.classList.remove("hidden");
				oTotal.element.firstChild.classList.add("running");
				summary(Date.now() - iStart);
				if (oFirstFailedTest) {
					select(oFirstFailedTest);
				}
			}
		}

		// runs a test: creates its frame (out of sight), registers first at the frame's page, then
		// at the frame's QUnit to observe the progress and notice when it's finished
		function runTest(oTest) {
			function onLoad() {
				var oQUnit = oTest.frame.contentWindow.QUnit;

				oTest.frame.removeEventListener("load", onLoad);
				// see https://github.com/js-reporters/js-reporters (@since QUnit 2)
				oQUnit.on("runStart", function (oDetails) {
					oTest.testCounts = oDetails.testCounts;
					oTest.testCounts.finished = 0;
					oTest.infoNode.data = ": 0/" + oTest.testCounts.total;
				});
				oQUnit.on("testEnd", function () {
					oTest.testCounts.finished += 1;
					oTest.infoNode.data = ": " + oTest.testCounts.finished + "/"
						+ oTest.testCounts.total;
				});
				oQUnit.on("runEnd", function (oDetails) {
					oTest.testCounts = oDetails.testCounts;
					summary(oDetails.runtime, oTest);
					oTest.element.firstChild.classList.remove("running");
					if (oDetails.status === "failed") {
						oTest.element.firstChild.classList.add("failed");
						oFirstFailedTest = oFirstFailedTest || oTest;
					} else {
						document.body.removeChild(oTest.frame);
						oTest.frame = undefined;
					}
					if (bVisible && oTest === oSelectedTest) {
						select(oTest); // unselect the test to make it invisible
					}
					iRunningTests -= 1;
					next();
				});
			}

			oTest.top = iTop;
			iTop += 1000;
			oTest.frame = document.createElement("iframe");
			oTest.frame.src = oTest.url;
			oTest.frame.setAttribute("height", "900");
			oTest.frame.setAttribute("width", "1600");
			oTest.frame.style.position = "fixed";
			oTest.frame.style.top = oTest.top + "px";
			document.body.appendChild(oTest.frame);
			oTest.element.firstChild.classList.add("running");
			iRunningTests += 1;
			oTest.frame.addEventListener("load", onLoad);
			if (bVisible) {
				select(oTest);
			}
		}

		// handler for a click on a test title, showing or hiding the frame
		function select(oTest) {
			var bSelect = oTest !== oSelectedTest;

			if (oSelectedTest) {
				oSelectedTest.element.classList.remove("selected");
				if (oSelectedTest.frame) {
					oSelectedTest.frame.style.position = "fixed";
					oSelectedTest.frame.style.top = oSelectedTest.top + "px";
				}
				oSelectedTest = null;
			}
			if (bSelect) {
				oSelectedTest = oTest;
				oTest.element.classList.add("selected");
				if (oTest.frame) {
					oTest.frame.style.position = null;
					oTest.frame.style.top = null;
				}
			}
		}

		// Adds the summary for a test or the total when no test is given
		function summary(iRuntime, oTest) {
			var oElement, iMinutes, iSeconds, sText;

			function count(iCount, sWhat) {
				return iCount ? ", " + iCount + " " + sWhat : "";
			}

			if (oTest) {
				oTotal.testCounts.failed += oTest.testCounts.failed;
				oTotal.testCounts.skipped += oTest.testCounts.skipped;
				oTotal.testCounts.todo += oTest.testCounts.todo;
				oTotal.testCounts.total += oTest.testCounts.total;
			} else {
				oTest = oTotal;
			}
			iRuntime = Math.round(iRuntime / 1000);
			iMinutes = Math.floor(iRuntime / 60);
			iSeconds = iRuntime - iMinutes * 60;
			sText = ": " + oTest.testCounts.total + " tests in "
				+ (iMinutes ? iMinutes + " min " : "")
				+ iSeconds + " sec"
				+ count(oTest.testCounts.failed, "failed")
				+ count(oTest.testCounts.skipped, "skipped")
				+ count(oTest.testCounts.todo, "todo")
				+ " ";

			oTest.infoNode.data = sText;

			if (oTest.url) {
				oElement = document.createElement("a");
				oElement.setAttribute("href", oTest.url);
				oElement.setAttribute("target", "_blank");
				oElement.appendChild(document.createTextNode("Rerun"));
				oTest.element.appendChild(oElement);
			}
		}

		setStatus();
		iFrames = getFrameCount();
		bVisible = !iFrames;
		document.getElementById("buttons").classList.add("hidden");
		document.getElementById("list").classList.remove("hidden");
		aTests = aTests.map(function (sUrl) {
			return createTest(sUrl, "../../" + sUrl);
		});
		oTotal = createTest("Finished");
		oTotal.testCounts = {
			failed : 0,
			skipped : 0,
			todo : 0,
			total : 0
		};
		oTotal.element.classList.add("hidden");
		if (bVisible) {
			next();
		} else {
			while (iFrames) {
				next();
				iFrames -= 1;
			}
		}
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
				runTests();
			} else {
				setStatus("Could not access the real OData server: "
					+ oLoginRequest.status + " " + oLoginRequest.statusText);
			}
		});
		oLoginRequest.send();
	}

	window.addEventListener("load", function () {
		var aMatches, bRealOData;

		document.getElementById("run").addEventListener("click", verifyConnectionAndRun);
		document.getElementById("runWithoutRealOData")
			.addEventListener("click", runTests.bind(null, false));
		aMatches = /realOData=(\w+)/.exec(location.search);
		bRealOData = aMatches && aMatches[1] === "true";
		if (bRealOData === null) { // no realOData given
			verifyConnectionAndRun();
		} else {
			runTests(bRealOData);
		}
	});
}());
