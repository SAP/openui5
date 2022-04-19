/*!
 * ${copyright}
 */
/*
  Test page that runs all QUnit and OPA tests of a team within a hidden inline frame (well, not
  actually hidden, but out of sight).

  The configuration must be given using the query option "team" which is expanded to a module name
  "BeforePush.<team>" in the same folder as this script. This module is expected to return a map of
  test files to 'full', 'integration' or 'both'.

  The page has two modes. As a default ("full mode") all tests are run except those with
  'integration'.

  With "integrationTestsOnly=true", all tests are run except those with 'full'. Coverage is measured
  for all tests, but no specific coverage is expected. This mode can be used to see which code is
  actually covered via integration tests. It can also be used to verify a POC (probably in
  combination with realOData=true to overcome "No Mockdata found" errors)

  Many of our tests can (and will) be run with "realOData=true" and perform tests against a back-end
  server using the SimpleProxy servlet. If BeforePush is called w/o realOData URL parameter, this
  page checks that this server can be accessed and asks for basic authentication, so that the tests
  themselves later run through without login popups. If this fails, the tests with "realOData=true"
  can be skipped.

  With "realOData=true" only tests having "realOData=true" in the URL are run.
  With "realOData=false" all tests are run with "realOData=true" stripped off.

  With "frames=n" you can run several tests in parallel to speed it up. When running only the
  verification, "frames=4" seems a valid option in Chrome, Edge, and Firefox. When testing with
  multiple browsers at once, it is better to run only one frame in each browser. When "frames=n" is
  given, all tests are run invisible.

  With "keepResults" the results for successful QUnit tests are NOT destroyed.

  BeforePush expects all tests to use QUnit 2.
*/
(function () {
	"use strict";
	var mParameters = getQueryParameters(),
		sServiceDocument = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
		mVariants = {
			"All tests" : {},
			"Integration tests only" : {integrationTestsOnly : true},
			"POC verification" : {integrationTestsOnly : true, realOData : true},
			"No realOData" : {realOData : false},
			"Only realOData" : {realOData : true}
		};

	// returns an array of tests according to the given flags
	function filterTests(mTests, bIntegration, bRealOData) {
		var sUnwanted = bIntegration ? "full" : "integration",
			aTests,
			mFilter = {};

		aTests = Object.keys(mTests).filter(function (sUrl) {
			return mTests[sUrl] !== sUnwanted;
		});
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
		if (bIntegration) {
			// ensure that each URL has the query property "coverage"
			aTests = aTests.map(function (sUrl) {
				if (!sUrl.includes("coverage")) {
					sUrl = sUrl + (sUrl.includes("?") ? "&" : "?") + "coverage";
				}
				return sUrl;
			});
		}
		return aTests;
	}

	function getFrameCount() {
		var iCount;

		if (!mParameters.frames) {
			return 0;
		}
		iCount = parseInt(mParameters.frames);
		if (!(iCount >= 1 && iCount <= 4)) { // this includes NaN
			setStatus("Frames set to 1. Use 1 up to 4 frames.");
			iCount = 1;
		}
		return iCount;
	}

	// parses the query parameters into a map
	function getQueryParameters() {
		var mParameters = {};

		// eslint-disable-next-line no-restricted-globals
		location.search.slice(1).split("&").forEach(function (sParameter) {
			var aParts = sParameter.split("=", 2);

			mParameters[aParts[0]] = aParts[1] || true;
		});

		return mParameters;
	}

	// whether the query parameter integrationTestsOnly is given
	function isIntegrationOnly() {
		return "integrationTestsOnly" in mParameters
			&& mParameters.integrationTestsOnly !== "false";
	}

	/**
	 * Runs the tests.
	 *
	 * @param {object} mTests
	 *   the map of test files to 'full', 'integration' or 'both'
	 * @param {boolean} [bRealOData]
	 *   if undefined, run all tests; if true, run only tests with "realOData=true"; if false, run
	 *   all tests without realOData (it is stripped off)
	 */
	function runTests(mTests, bRealOData) {
		var oFirstFailedTest,
			iFrames,
			iRunningTests = 0,
			oSelectedTest,
			iStart = Date.now(),
			aTests = filterTests(mTests, isIntegrationOnly(), bRealOData),
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
			return undefined;
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
					} else if (!mParameters.keepResults) {
						// remove iframe in order to free memory
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
		document.getElementById("list").classList.remove("hidden");
		aTests = aTests.map(function (sUrl) {
			return createTest(sUrl, "test-resources/sap/ui/core/" + sUrl);
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

	function setTitle(sTeam) {
		var oElement = document.getElementById("h1"),
			sTitle = document.title + ": " + sTeam;

		document.title = sTitle;
		oElement.firstChild.textContent = sTitle;
	}

	// Shows a list of links to the most common variants
	function variants() {
		var oList = document.getElementById("variants"),
			mQueryOptions = {
				team : mParameters.team,
				frames : mParameters.frames || 4
			};

		Object.keys(mVariants).forEach(function (sTitle) {
			var oAnchor = document.createElement("a"),
				oItem = document.createElement("li"),
				mVariantQueryOptions = Object.assign({}, mQueryOptions, mVariants[sTitle]),
				sQuery = Object.keys(mVariantQueryOptions).map(function (sKey) {
						return sKey + "=" + mVariantQueryOptions[sKey];
					}).join("&");

			oAnchor.setAttribute("href",
				"test-resources/sap/ui/core/qunit/internal/BeforePush.html?" + sQuery);
			oAnchor.appendChild(document.createTextNode(sTitle));
			oItem.appendChild(oAnchor);
			oList.appendChild(oItem);
		});
	}

	// For the onload handler and the button "Run"
	function verifyConnectionAndRun(mTests, bRealOData) {
		// send a request to the service document from the v4 sample service to ensure that
		// the credentials are known before running the test suite.
		fetch(sServiceDocument, {method : "HEAD"}).then(function (oResponse) {
			if (oResponse.ok) {
				runTests(mTests, bRealOData);
			} else {
				setStatus("Could not access the real OData server: "
					+ oResponse.status + " " + oResponse.statusText);
				variants();
			}
		});
	}

	// configure the UI5 loader
	sap.ui.loader.config({
		baseUrl : "resources",
		paths : {
			"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit",
			"sap/ui/test/qunit" : "test-resources/sap/ui/test/qunit"
		}
	});

	window.addEventListener("load", function () {
		var sTestsScript = "sap/ui/core/qunit/internal/BeforePush." + mParameters.team;

		if (!mParameters.team) {
			setStatus("missing 'team' parameter");
			return;
		}
		setTitle(mParameters.team);
		if (mParameters.variants) {
			variants();
			return;
		}
		sap.ui.require([sTestsScript], function (mTests) {
			switch (mParameters.realOData) {
				case "false":
					runTests(mTests, false);
					break;
				case "true":
					verifyConnectionAndRun(mTests, true);
					break;
				default:
					verifyConnectionAndRun(mTests);
			}
		});
	});
}());
