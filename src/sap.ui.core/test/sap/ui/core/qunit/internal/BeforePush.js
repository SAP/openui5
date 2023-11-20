/*!
 * ${copyright}
 */
/*
  Test page that runs all QUnit and OPA tests of a team within a hidden inline frame (well, not
  actually hidden, but out of sight).

  The configuration must be given using the query option "team" which is expanded to a UI5 module
  named "BeforePush.<team>" in the same folder as this script. This module is expected to return a
  map of test URLs to 'full', 'integration' or 'both'. These URLs must be relative to the UI5 folder
  "test-resources/sap/ui/core"; the test runner "Test.qunit.html" may be given without path.

  The page has two modes. As a default ("full mode") all tests are run except those with
  'integration'.

  With "integrationTestsOnly=true", all tests are run except those with 'full'. Coverage is measured
  for all tests, but no specific coverage is expected. This mode can be used to see which code is
  actually covered via integration tests. It can also be used to verify a POC (probably in
  combination with realOData=true to overcome "No Mockdata found" errors)

  Many of our tests can (and will) be run with "realOData=true" and perform tests against a back-end
  server using a reverse proxy. If BeforePush is called w/o realOData URL parameter, this page
  checks that this server can be accessed and asks for basic authentication, so that the tests
  themselves later run through without login popups. If this fails, a list of common variants is
  shown. Use the query option "variants" to see this list immediately.

  With "realOData=true" only tests having "realOData=true" in the URL are run.
  With "realOData=false" all tests are run with "realOData=true" stripped off.

  With "frames=n" you can run several tests in parallel to speed it up. When running only the
  verification, "frames=4" seems a valid option in Chrome, Edge, and Firefox. When testing with
  multiple browsers at once, it is better to run only one frame in each browser. When "frames=n" is
  given, all tests are run invisible. BeforePush remembers the run times of the tests in the local
  storage. In subsequent runs the longest-running tests are started first to ensure an optimal
  utilization of the n frames.

  With "keepResults" the results for successful QUnit tests are NOT destroyed.

  BeforePush expects all tests to use QUnit 2.
*/
(function () {
	"use strict";
	var mParameters = getQueryParameters(),
		sLastKey = "BeforePush." + mParameters.team + ".last",
		sServiceDocument = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
		mVariants = {
			"All tests" : {},
			"Integration tests only" : {integrationTestsOnly : true},
			"POC verification" : {integrationTestsOnly : true, realOData : true},
			"No realOData" : {realOData : false},
			"Only realOData" : {realOData : true}
		};

	// adds buttons for all the actions to the corresponding <div>
	function actions(mActions) {
		if (!mActions) {
			return;
		}
		const oDiv = document.getElementById("actions");
		for (const [sTitle, fnAction] of Object.entries(mActions)) {
			const oButton = document.createElement("button");
			oButton.innerText = sTitle;
			oButton.onclick = fnAction.bind(null, setStatus);
			oDiv.appendChild(oButton);
		}
	}

	// returns an array of tests according to the given flags
	function filterTests(mTests, bIntegration, bRealOData) {
		var sUnwanted = bIntegration ? "full" : "integration",
			aTests,
			mFilter = {};

		aTests = Object.keys(mTests).filter(function (sUrl) {
			return mTests[sUrl] !== sUnwanted;
		});
		if (bRealOData === false) {
			aTests = aTests.filter(function (sUrl) {
				var sTest = sUrl.replace(/\?.*$/, ""), // the URL w/o query parameters
					// run the test unless it is realOData and there was already one for this URL
					bRun = !(sUrl.includes("realOData=true") && sTest in mFilter);

				mFilter[sTest] = true;
				return bRun;
			}).map(function (sUrl) {
				return sUrl.replace(/realOData=true(&|$)/, "").replace(/[?&]$/, "");
			});
		} else if (bRealOData === true) {
			aTests = aTests.filter(function (sTest) {
				return sTest.includes("realOData=true");
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

	// loads the run times of the last run
	function loadLastRun() {
		return JSON.parse(localStorage.getItem(sLastKey) || "{}");
	}

	// adjusts the URL to the page's base, knows where Test.qunit.html is
	function normalizeUrl(sSimplifiedUrl) {
		return sSimplifiedUrl.startsWith("Test.qunit.html?")
			? "../../../../resources/sap/ui/test/starter/" + sSimplifiedUrl
			: "test-resources/sap/ui/core/" + sSimplifiedUrl;
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
			mLastRun = loadLastRun(),
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
					text : sText,
					url : sUrl
				},
				oDiv = document.createElement("div");

			oTest.element.appendChild(oDiv);
			oTest.icon = document.createElement("div");
			oTest.icon.classList.add("status");
			oDiv.appendChild(oTest.icon);
			oDiv.addEventListener("click", select.bind(null, oTest));
			oDiv.appendChild(document.createTextNode(sText));
			oTest.infoNode = document.createTextNode("");
			oTest.element.appendChild(oTest.infoNode);
			document.getElementById("results").appendChild(oTest.element);
			oTest.last = mLastRun[oTest.text] || 0;
			return oTest;
		}

		// starts another test or shows the summary
		function next() {
			if (aTests.length) {
				runTest(aTests.shift());
			} else if (!iRunningTests) {
				oTotal.element.classList.remove("hidden");
				oTotal.element.firstChild.classList.add("running");
				summary(Date.now() - iStart);
				saveLastRun(mLastRun);
				if (oFirstFailedTest) {
					select(oFirstFailedTest);
				}
			}
		}

		// runs a test: creates its frame (out of sight), registers first at the frame's page, then
		// at the frame's QUnit to observe the progress and notice when it's finished
		function runTest(oTest) {
			// finishes the test: sets the CSS according to the status, removes the frame and starts
			// the next test
			function finish(bFailed) {
				oTest.element.firstChild.classList.remove("running");
				if (bFailed) {
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
			}

			// observes QUnit within the test frame
			function observe(oQUnit) {
				// see https://github.com/js-reporters/js-reporters (@since QUnit 2)
				oQUnit.on("runStart", function (oDetails) {
					oTest.testCounts = oDetails.testCounts;
					progress(0);
				});
				oQUnit.on("testEnd", function () {
					progress(oTest.testCounts.finished + 1);
				});
				oQUnit.on("runEnd", function (oDetails) {
					oTest.testCounts = oDetails.testCounts;
					summary(oDetails.runtime, oTest);
					finish(oDetails.status === "failed");
				});
			}

			function onFrameLoad() {
				oTest.frame.removeEventListener("load", onFrameLoad);
				waitForQUnit(5);
			}

			function progress(iFinished) {
				oTest.testCounts.finished = iFinished;
				oTest.infoNode.data = ": " + iFinished + "/" + oTest.testCounts.total;
			}

			// searches QUnit within the test frame; waits iRetryCount times for one second if not
			// found
			function waitForQUnit(iRetryCount) {
				var oQUnit = oTest.frame.contentWindow.QUnit;

				if (oQUnit && oQUnit.on) {
					observe(oQUnit);
				} else if (iRetryCount) {
					// retry after a second
					setTimeout(waitForQUnit.bind(null, iRetryCount - 1), 1000);
				} else {
					oTest.infoNode.data = oQUnit ? " no QUnit V2 found" : " no QUnit found";
					finish(true);
				}
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
			oTest.frame.addEventListener("load", onFrameLoad);
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
				oTest.icon.appendChild(
					document.createTextNode(oTest.testCounts.failed ? "\u2716" : "\u2714"));
				oElement = document.createElement("a");
				oElement.setAttribute("href", oTest.url);
				oElement.setAttribute("target", "_blank");
				oElement.appendChild(document.createTextNode("Rerun"));
				oTest.element.appendChild(oElement);
				if (!oTest.testCounts.failed || !mLastRun[oTest.text]) {
					mLastRun[oTest.text] = iRuntime;
				}
			}
		}

		setStatus();
		iFrames = getFrameCount();
		bVisible = !iFrames;
		document.getElementById("list").classList.remove("hidden");
		aTests = aTests.map(function (sSimplifiedUrl) {
			var sUrl = normalizeUrl(sSimplifiedUrl);

			if (sSimplifiedUrl.includes("Test.qunit.html")) {
				sSimplifiedUrl = sSimplifiedUrl
					.replace(/^.*Test.qunit.html\?testsuite=.*&test=/, "")
					.replace("&supportAssistant=true", "");
			}
			return createTest(sSimplifiedUrl, sUrl);
		});
		aTests.sort(function (oTest1, oTest2) { return oTest2.last - oTest1.last; });
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

	// saves the run times of the current run
	function saveLastRun(mLastRun) {
		localStorage.setItem(sLastKey, JSON.stringify(mLastRun));
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

	// Show a list of test apps (if given). mApps must be a map from name to an array of URLs:
	// the app, the app with realOData, the OPA and (optionally) the OPA with realOData
	function showApps(mApps) {
		var oTable = document.getElementById("apps");

		function addCell(oRow, sText, sUrl) {
			var oCell = document.createElement("td"),
				oTextNode = document.createTextNode(sText),
				oContent = oTextNode;

			if (sUrl) {
				oContent = document.createElement("a");
				oContent.setAttribute("href", normalizeUrl(sUrl));
				oContent.appendChild(oTextNode);
			}
			oCell.appendChild(oContent);
			oRow.appendChild(oCell);
		}

		if (!mApps) {
			return;
		}
		Object.keys(mApps).forEach(function (sApp) {
			var aLinks = mApps[sApp],
				oRow = document.createElement("tr");

			addCell(oRow, sApp);
			addCell(oRow, "App", aLinks[0]);
			addCell(oRow, "(realOData)", aLinks[1]);
			addCell(oRow, "OPA", aLinks[2]);
			if (aLinks.length > 3) {
				addCell(oRow, "(realOData)", aLinks[3]);
			}
			oTable.appendChild(oRow);
		});
	}

	// Shows a list of links to the most common variants
	function variants() {
		var oList = document.getElementById("variantsList"),
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
		document.getElementById("variants").classList.remove("hidden");
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
		sap.ui.require([sTestsScript], function (oConfig) {
			if (mParameters.variants) {
				actions(oConfig.actions);
				variants();
				showApps(oConfig.apps);
				return;
			}
			switch (mParameters.realOData) {
				case "false":
					runTests(oConfig.tests, false);
					break;
				case "true":
					verifyConnectionAndRun(oConfig.tests, true);
					break;
				default:
					verifyConnectionAndRun(oConfig.tests);
			}
		});
	});
}());
