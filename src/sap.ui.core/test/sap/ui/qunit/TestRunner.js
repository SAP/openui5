(function(globalThis) {
	"use strict";
	/*global CollectGarbage */
	/*
	 * Simulate the JSUnit Testsuite to collect the available
	 * test pages per Suite
	 */
	globalThis.jsUnitTestSuite = function() {};
	globalThis.jsUnitTestSuite.prototype.getTestPages = function() {
		return this.aPages;
	};
	globalThis.jsUnitTestSuite.prototype.addTestPage = function(sTestPage) {
		this.aPages = this.aPages || [];
		// in case of running in the root context the testsuites right now
		// generate an invalid URL because they assume that test-resources is
		// the context path - this section makes sure to remove the duplicate
		// test-resources segments in the path
		if (sTestPage.indexOf("/test-resources/test-resources") === 0 || sTestPage.indexOf("/test-resources/resources") === 0) {
			sTestPage = sTestPage.substr("/test-resources".length);
		}
		this.aPages.push(sTestPage);
	};
	class Deferred {
		constructor() {
			this.promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		}
	}
	const byId = (id) => document.getElementById(id);
	const querySelector = (selector, root = document) => root.querySelector(selector);
	const querySelectorAll = (selector, root = document) => root.querySelectorAll(selector);
	const h = (name, ext, content) => {
		const el = document.createElement(name);
		if ( typeof ext === "string" ) {
			el.className = ext;
		} else if ( ext ) {
			Object.entries(ext).forEach(
				([key, value]) => {
					if ( key === "style" ) {
						Object.assign(el.style, value);
					} else if ( typeof value === "function" && key.startsWith("on") ) {
						el.addEventListener(key.slice(2), value);
					} else {
						el.setAttribute(key, value);
					}
				}
			);
		}
		if ( Array.isArray(content) ) {
			content.forEach((item) => el.appendChild(item));
		} else if ( content ) {
			content.split("<br>").forEach((text, idx) => {
				if ( idx > 0 ) {
					el.appendChild(document.createElement("BR"));
				}
				el.appendChild(document.createTextNode(text));
			});
		}
		return el;
	};
	const click = (id, callback) => byId(id).addEventListener("click", callback);
	const toggleDisplay = (elem, bForceOpenClose) => {
		const aElements = Array.isArray(elem) ? elem : [elem];
		aElements.forEach((elem) => {
			const bOpen = bForceOpenClose ?? globalThis.getComputedStyle(elem).display === "none";
			const domElem = typeof elem === "string" ? byId(elem) : elem;
			domElem.style.display = bOpen ? "" : "none";
		});
	};
	const setVisibile = (elem, bVisible) => {
		const aElements = Array.isArray(elem) ? elem : [elem];
		aElements.forEach((elem) => {
			const domElem = typeof elem === "string" ? byId(elem) : elem;
			domElem.style.visibility = bVisible ? "" : "hidden";
		});
	};

	function toggleArea(sAreaId, bForceOpenClose) {
		const uiArea = byId(sAreaId),
			bOpen = bForceOpenClose ?? uiArea.classList.contains("collapsed");

		uiArea.classList.add(bOpen ? "expanded" : "collapsed");
		uiArea.classList.remove(bOpen ? "collapsed" : "expanded");

		return bOpen;
	}
	class FetchQueue {
		constructor(iMaxParallelRequests, iWaitTime) {
			this.iLimit = iMaxParallelRequests === undefined ? Infinity : iMaxParallelRequests;
			this.iWaitTime = iWaitTime === undefined ? 0 : iWaitTime;
			this.aPendingTasks = [];
			this.oRunningTasks = new Set();
			this.iLastTaskExecution = -Infinity;
		}
		fetch(sUrl, options) {
			var oTask = Object.assign(new Deferred(), {
				url: sUrl,
				options: options
			});
			this.aPendingTasks.push(oTask);
			this._processNext();
			return oTask.promise;
		}
		_processNext() {
			var iNow = Date.now();
			var iDelay = iNow - this.iLastTaskExecution;
			if ( iDelay < this.iWaitTime ) {
				setTimeout(() => this._processNext(), iDelay);
				return;
			}
			if ( this.aPendingTasks.length > 0 && this.oRunningTasks.size < this.iLimit ) {
				var oTask = this.aPendingTasks.shift();
				this.oRunningTasks.add(oTask);
				this.iLastTaskExecution = iNow;
				fetch(oTask.url, oTask.options)
					.then((response) => {
						const sResponseText = response.text();
						return response.ok ? oTask.resolve(sResponseText) : oTask.reject(sResponseText);
					})
					.finally(() => {
						this.oRunningTasks.delete(oTask);
						this._processNext();
					});
			}
		}
	}
	/**
	 * Utility class to find test pages and check them for being
	 * a testsuite or a QUnit testpage.
	 */
	class Discovery {
		#fetchQueue = new FetchQueue(50, 2);
		checkTestPage(sTestPage, bSequential) {
			return this.#checkTestPage(sTestPage, bSequential);
		}
		async #checkTestPage(sTestPage, bSequential) {
			if (typeof sTestPage !== "string") {
				console.log("QUnit: invalid test page specified"); // eslint-disable-line no-console
				throw new Error("QUnit: invalid test page specified");
			}
			// console.log("QUnit: checking test page: " + sTestPage);
			// check for an existing test page and check for test suite or page
			const sData = await this.#fetchQueue.fetch(sTestPage).catch((err) => {
				console.error(`QUnit: failed to load page '${sTestPage}':`, err); // eslint-disable-line no-console
				return null;
			});
			if ( sData == null ) {
				return [];
			}
			if (/(?:window\.suite\s*=|function\s*suite\s*\(\s*\)\s*{)/.test(sData)
				|| (/data-sap-ui-testsuite/.test(sData) && !/sap\/ui\/test\/starter\/runTest/.test(sData))
				|| /sap\/ui\/test\/starter\/createSuite/.test(sData) ) {
				const aTestPages = await this.#collectPagesFromSuite(sTestPage, bSequential);
				console.info(`got test pages for ${sTestPage}: ${aTestPages.length}`); // eslint-disable-line no-console
				return aTestPages;
			} else {
				return [sTestPage];
			}
		}
		#collectPagesFromSuite(sTestPage, bSequential) {
			const oDeferred = new Deferred();
			const onSuiteReady = async (oIFrame) => {
				const aTestPages = await this.#findTestPages(oIFrame, bSequential).catch((oError) => {
					console.error(`QUnit: failed to load page '${sTestPage}', Error:`, oError); // eslint-disable-line no-console
					return [];
				});
				frame.remove();
				// avoid duplicates in test pages
				const aUniqueTestPages = aTestPages.filter((e, i, a) => a.indexOf(e) === i);
				console.info(`test pages for ${sTestPage}: ${aUniqueTestPages.length}`); // eslint-disable-line no-console
				oDeferred.resolve(aUniqueTestPages);
			};
			const frame = h("frame", {
				style: {
					display: "none"
				},
				onload: function() {
					if (typeof this.contentWindow.suite === "function") {
						onSuiteReady(this);
					} else {
						// Wait for a CustomEvent in case window.suite isn't defined, yet
						this.contentWindow.addEventListener("sap-ui-testsuite-ready", function() {
							onSuiteReady(this);
						}.bind(this));
					}
				},
				src: sTestPage
			});
			document.body.appendChild(frame);
			return oDeferred.promise;
		}
		async #findTestPages(oIFrame, bSequential) {
			const oSuite = await oIFrame.contentWindow.suite();
			const aPages = oSuite?.getTestPages() ?? [];
			try {
				if (aPages.length > 0) {
					const aTestPagePromises = [];
					let aTestPages;
					if (bSequential) {
						aTestPages = [];
						aTestPagePromises.push(aPages.reduce(function(oPromise, sTestPage) {
							return oPromise.then(this.#checkTestPage.bind(this, sTestPage, bSequential)).then(function(aFoundTestPages) {
								aTestPages = aTestPages.concat(aFoundTestPages);
							});
						}.bind(this), Promise.resolve([])).then(function() {
							return aTestPages;
						}));
					} else {
						for (var i = 0, l = aPages.length; i < l; i++) {
							var sTestPage = aPages[i];
							aTestPagePromises.push(this.#checkTestPage(sTestPage, bSequential));
						}
					}
					if (aTestPagePromises.length > 0) {
						const aFoundTestPages = await Promise.all(aTestPagePromises);
						aTestPages = [];
						for (let i = 0, l = aFoundTestPages.length; i < l; i++) {
							aTestPages = aTestPages.concat(aFoundTestPages[i]);
						}
						return aTestPages;
					}
				}
			} catch (ex) {
				console.error("QUnit: error while analyzing test page '" + oIFrame.src + "':\n", ex); // eslint-disable-line no-console
			}
			return [];
		}
	}
	class ProgressBar {
		constructor(selector) {
			this.selector = selector;
			this.selector.classList.add("progressBar");
			this.selector.appendChild(h("div", {id: "innerBar"}, "0%"));
		}
		progress(nBarStep) {
			const innerBar = byId("innerBar");
			var nBarwidth = parseFloat(innerBar.style.width);
			var sNewwidth = nBarwidth + nBarStep + "%";
			innerBar.textContent = Math.round(nBarwidth + nBarStep) + "%";
			innerBar.style.width = sNewwidth;
			if (parseInt(querySelector("div#reportingHeader span.failed").innerText) > 0) {
				innerBar.style.backgroundColor = '#ed866f';
			}
			const time = byId("time");
			time.textContent = Math.round((new Date() - globalThis.oStartTime) / 1000) + " Seconds";
		}
		reset() {
			byId("innerBar").style.width = "0%";
		}
	}
	let progressBar;
	const discovery = new Discovery();
	/**
	 * Utility class to find test pages and check them for being
	 * a testsuite or a QUnit testpage - also it returns the coverage
	 * results.
	 */
	class TestRunner {
		// TODO clarify for what is the internal flag used
		async runTests(aTestPages, nBarStep) {
			const sTestPage = aTestPages.shift();
			if (sTestPage) {
				await this.runTest(sTestPage).then(() => {
					progressBar.progress(nBarStep);
				});
				querySelectorAll("#selectedTests > option").forEach((item) => {
					if (item.textContent === sTestPage) {
						item.remove();
					}
				});
				return this.runTests(aTestPages, nBarStep);
			}
		}
		printTestResultAndRemoveFrame(frame, framediv, oContext) {
			/**
			 * Blanket should not be possible to be used anymore since already the loader uses incompatible ES6 syntax
			 * in case of coverage either merge it or set it on the _$blanket object
			 * @deprecated
			*/
			if (frame.contentWindow._$blanket) {
				var oBlanketCoverage = frame.contentWindow._$blanket;
				globalThis._$blanket = globalThis._$blanket || {};
				for (const sModule in oBlanketCoverage) {
					const aCoverageInfo = oBlanketCoverage[sModule];
					if (!globalThis._$blanket[sModule]) {
						globalThis._$blanket[sModule] = aCoverageInfo;
					} else {
						aCoverageInfo.forEach((iIndex, iCount) => {
							globalThis._$blanket[sModule][iIndex] += iCount;
						});
					}
				}
			}
			frame.src = "about:blank";
			frame.contentWindow.document.write('');
			frame.contentWindow.close();
			if ( typeof CollectGarbage == "function") {
				CollectGarbage(); // eslint-disable-line
			}
			framediv.remove();
			this.printTestResult(oContext);
		}
		printTestResult(oContext) {
			const toggleSibling = (e) => toggleDisplay(e.target.nextElementSibling);
			const toggleSibling2 = (e) => toggleDisplay(e.target.nextElementSibling.nextElementSibling);
			oContext.tests.forEach(({outcome, header, results}) => {
				const div =
					h("div", `testResult ${outcome}`, [
						h("p", {onclick: toggleSibling}, header),
						h("ol", {style: {display: "none"}}, results.map(({result}) =>
							h("li", `${result.sLiClass} test`, [
								h("p", {style: {display: "inline"}, onclick: toggleSibling2},
									`${result.TestName} (${result.Failed} ,${result.Passed} ,${result.All}) `),
								h("a", {href: result.rerunlink}, " Rerun"),
								h("ol", null, result.testmessages.map(({classname, message, expected, actual, diff, source}) =>
									h("li", `${classname} check`,
									`${message}<br>${expected}<br>${actual}<br>${diff}<br>${source}`)
								))
							])
						))
					]);
				querySelector("div#reportingContent").appendChild(div);
			});
		}
		runTest(sTestPage) {
			if (this._bStopped) {
				delete this._bStopped;
				return Promise.reject();
			}
			const oDeferred = new Deferred();
			if (this.getUrlParameter("hidepassed") !== null) {
				sTestPage += (sTestPage.includes("?") ? "&" : "?") + "hidepassed";
			}
			// we could make this configurable
			const frame = h("iframe", {style: {height: "1024px", width: "1280px"}, src: sTestPage});
			const framediv = h("div", {style: {
				height: "400px",
				width: "100%",
				overflow: "scroll"
			}}, [frame]);
			querySelector("div.test-execution").appendChild(framediv);
			const iTestTimeout = parseInt(this.getUrlParameter("test-timeout")) || 300000;
			const tBegin = Date.now();
			const fnCheckSuccess = () => {
				var doc = frame.contentWindow.document;
				var sTestName = querySelector("h1#qunit-header > a", doc)?.text;
				var results = querySelectorAll("ol#qunit-tests > li", doc);
				var qunitBanner = querySelector("#qunit-banner", doc);
				if (qunitBanner?.classList.contains("qunit-fail") || qunitBanner?.classList.contains("qunit-pass")) {
					if (!sTestName) {
						sTestName = "QUnit page for " + doc.baseURI.substring(doc.baseURI.indexOf("test-resources") + 15, doc.baseURI.length);
					}
					const oContext = this.#extractTestResults(sTestName, results);
					this.printTestResultAndRemoveFrame(frame, framediv, oContext);
					oDeferred.resolve();
					return;
				}
				if (Date.now() - tBegin < iTestTimeout) {
					setTimeout(fnCheckSuccess, 100);
				} else {
					const QUnit = frame.contentWindow.QUnit;
					let oContext;
					if (QUnit) {
						// push a failure and add the results that where run to the report
						oContext = this.#extractTestResults(sTestName, results);
						oContext.tests[0].header = "Testsuite was not completed after " + Math.round(iTestTimeout / 1000) + " seconds : " + sTestName;
						oContext.tests[0].outcome = "fail";
						oContext.tests[0].results.push(
							{
								result : {
									TestName: "Timeout occured",
									outcome: "fail",
									Failed: "1",
									Passed: "0",
									All: "1",
									rerunlink : frame.contentWindow.location.href,
									sLiClass: "fail",
									testmessages: ["no assertions"]
								}
							}
						);
					} else {
						// No qunit print error message
						oContext = this.#createFailContext(frame.contentWindow.location.href, "Testsite did not load QUnit after 5 minutes");
					}
					this.printTestResultAndRemoveFrame(frame, framediv, oContext);
					oDeferred.resolve();
				}
			};
			fnCheckSuccess();
			return oDeferred.promise;
		}
		#createFailContext(sHref, sHeaderMessage) {
			this.updateResultHeader("1", "0", "1");
			return {
				tests: [{
					header: sHeaderMessage + " : " + sHref,
					outcome: "fail",
					results:[
						{
							result: {
								TestName: "No test where run",
								Failed: "1",
								Passed: "0",
								All: "1",
								rerunlink : sHref,
								sLiClass: "fail",
								testmessages: ["no assertions"]
							}
						}
					]
				}]
			};
		}
		stopTests() {
			this._bStopped = true;
		}

		/**
		 * @deprecated
		 */
		hasCoverage() {
			return !!this.getCoverage();
		}

		/**
		 * @deprecated
		 */
		getCoverage() {
			return globalThis._$blanket || globalThis.top.__coverage__;
		}

		/**
		 * @deprecated
		 */
		async reportCoverage(reportToEl) {
			var oCoverage = this.getCoverage();
			if (!oCoverage) {
				return;
			}
			if ( globalThis.blanket && !globalThis.top.__coverage__ ) {
				globalThis.blanket.report({});
				return;
			}

			const response = await fetch("/.ui5/coverage/report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(globalThis.top.__coverage__)
			});
			const oData = await response.json();
			// HTML is the only one that makes sense and provides understandable information
			const oHTMLReport = oData.availableReports.find((report) => report.report === "html");
			if (!oHTMLReport) { // Do not render reports if HTML or lcov are not provided
				return;
			}
			reportToEl.appendChild(
				h("iframe", {
					style : {
						border : "none",
						width : "100%",
						height : "100vh"
					},
					sandbox: "allow-scripts",
					src: "/.ui5/coverage/report/" + oHTMLReport.destination
				})
			);
		}
		getTestPageUrl(sFallbackUrl) {
			// TODO rewrite using URL
			const sTestPageUrl = this.getUrlParameter("testpage");
			if (sTestPageUrl) {
				const sOrigin = globalThis.location.origin;
				// Check whether first character is "/"
				if (sTestPageUrl.match(/^\/(?!\/)/)) {
					return sOrigin + sTestPageUrl;
				}
				// sTestPageUrl might be a full href
				// => check whether protocol and host matches current location
				const aTestPageUrlMatch = sTestPageUrl.match(/^(https?:\/\/[^\/]+)(\/.*)$/i);
				if (aTestPageUrlMatch && aTestPageUrlMatch[1] === sOrigin) {
					// Still use the known current location and append given path segment just to make sure
					return sOrigin + aTestPageUrlMatch[2];
				}
				throw new Error("Invalid value for URL parameter 'testpage': Path segment must start with '/'. " +
					"If given, protocol and host must match the current location.");
			}
			// Fallback to generic testsuite page
			if ( sFallbackUrl == null ) {
				let sContextPath;
				// Match the path segment before the first "test-resources" segment
				const aContextPathMatch = globalThis.location.pathname.match(/(.*?)\/(?:test-resources)/);
				if (aContextPathMatch && aContextPathMatch[1]) {
					sContextPath = aContextPathMatch[1];
				} else {
					sContextPath = "";
				}
				sFallbackUrl = sContextPath + "/test-resources/qunit/testsuite.qunit.html";
			}
			return sFallbackUrl;
		}
		getAutoStart() {
			const sAutoStart = this.getUrlParameter("autostart");
			return sAutoStart == "true";
		}
		getUrlParameter(sName) {
			const params = new URLSearchParams(globalThis.location.search);
			return params.get(sName);
		}
		updateResultHeader(sNumAll, sNumPassed, sNumFailed) {
			const total = querySelector("div#reportingHeader span.total");
			total.textContent = parseInt(total.textContent) + parseInt(sNumAll);
			const passed = querySelector("div#reportingHeader span.passed");
			passed.textContent = parseInt(passed.textContent) + parseInt(sNumPassed);
			const failed = querySelector("div#reportingHeader span.failed");
			failed.textContent = parseInt(failed.textContent) + parseInt(sNumFailed);
		}
		#extractTestResults(sHeader, aTestResults) {
			// build the context
			const oContext = {
				tests: [{
					header: sHeader,
					outcome: "pass",
					results:[]
				}]
			};
			for (let i = 0; i < aTestResults.length; i++) {
				const $checkItems = querySelectorAll("ol > li", aTestResults[i]);
				const aTestMessages = [];
				for (let y = 0; y < $checkItems.length; y++) {
					const oTestMessage = {
						message: "",
						expected: "",
						actual: "",
						diff: "",
						source: "",
						classname: $checkItems[y].className
					};
					if ($checkItems[y].className === "pass") {
						oTestMessage.message = $checkItems[y].textContent;
					} else {
						const messageSpan = querySelector("span.test-message", $checkItems[y]);
						oTestMessage.message = messageSpan.textContent;
						const testExpected = querySelector("tr.test-expected", $checkItems[y]);
						if (testExpected) {
							oTestMessage.expected = testExpected.textContent;
						}
						const testActual = querySelector("tr.test-actual", $checkItems[y]);
						if (testActual) {
							oTestMessage.actual = testActual.textContent;
						}
						const testDiff = querySelector("tr.test-diff", $checkItems[y]);
						if (testDiff) {
							oTestMessage.diff = testDiff.textContent;
						}
						const testSource = querySelector("tr.test-source", $checkItems[y]);
						if (testSource) {
							oTestMessage.source = testSource.textContent;
						}
					}
					aTestMessages.push(oTestMessage);
				}
				const test = aTestResults[i];
				const sTestSummary = [...querySelector("strong", test).childNodes].reduce((result, node) => {
					result += node.textContent || '';
					return result;
				}, "");
				const m = sTestSummary.match(/^([\S\s]*)\((\d+)(?:,\s*(\d+),\s*(\d+))?\)\s*$/);
				let sTestName;
				let sNumFailed;
				let sNumPassed;
				let sNumAll;
				// test still running
				if (!m) {
					sTestName = sTestSummary + " - Timed out and did not run completely";
					sNumPassed = 0;
					sNumFailed = sNumAll = "1";
				} else {
					sTestName = m[1];
					if ( m[3] || m[4] ) {
						sNumFailed = m[2];
						sNumPassed = m[3];
						sNumAll = m[4];
					} else {
						sNumPassed = sNumAll = m[2];
						sNumFailed = "0";
					}
				}
				const sRerunLink = test.querySelector("A").href;
				const sLineItemClass = sNumFailed === "0" ? "pass" : "fail";
				if (sLineItemClass === "fail") {
					oContext.tests[0].outcome = sLineItemClass;
				}
				oContext.tests[0].results.push({result:{
					TestName: sTestName,
					Failed: sNumFailed,
					Passed: sNumPassed,
					All: sNumAll,
					rerunlink: sRerunLink,
					sLiClass: sLineItemClass,
					testmessages: aTestMessages }
				});
				this.updateResultHeader(sNumAll, sNumPassed, sNumFailed);
			}
			return oContext;
		}
		checkTestPage(...args) {
			const pDone = discovery.checkTestPage(...args);
			pDone.done = pDone.then;
			return pDone;
		}
	}
	const testRunner = new TestRunner();

	/**
	 * @deprecated
	 */
	(() => {
		const oScript = document.createElement('SCRIPT');
		oScript.src = "/resources/sap/ui/thirdparty/blanket.js";
		document.head.appendChild(oScript);
	})();

	/**
	 * Utility class to find test pages and check them for being
	 * a testsuite or a QUnit testpage - also it returns the coverage
	 * results.
	 */
	// ui5lint-disable no-globals
	globalThis.sap = globalThis.sap || {};
	globalThis.sap.ui = globalThis.sap.ui || {};
	globalThis.sap.ui.qunit = globalThis.sap.ui.qunit || {};
	globalThis.sap.ui.qunit.TestRunner = testRunner;
	// ui5lint-enable no-globals
	const ready = () => {
		return new Promise(function(resolve, reject) {
			if (document.readyState !== "loading") {
				resolve();
			} else {
				var fnDomReady = function(res) {
					document.removeEventListener("DOMContentLoaded", fnDomReady);
					resolve();
				};
				document.addEventListener("DOMContentLoaded", fnDomReady);
			}
		});
	};

	ready().then(function() {
		/**
		 * Helper functions
		 */
		function prepareNewRun() {
			progressBar.reset();
			toggleArea("test-selection", false);
			toggleDisplay("test-reporting", false);
			querySelector("div#reportingContent").innerHTML = "";
			querySelector("span.total").textContent =
			querySelector("span.passed").textContent =
			querySelector("span.failed").textContent = "0";
			/**
			 * @deprecated
			 */
			(() => {
				querySelector("#coverageFrame")?.remove();
				querySelector("#coverageContent > iframe")?.remove();
				toggleDisplay("test-coverage", false);
				delete globalThis._$blanket;
				delete globalThis.top.__coverage__;
			})();
		}

		function createTestPageSelectionOptions(sFilter) {
			byId("testPageSelect").innerHTML  = "";
			const oFilterRegex = new RegExp(sFilter, "gi");
			globalThis.aTestPages.forEach((page) => {
				if (!sFilter || page.match(oFilterRegex) !== null) {
					const optionElement = h("option", {
						value: page,
						ondblclick: (event) => {
							copy([event.target]);
						}
					}, page);
					byId("testPageSelect").appendChild(optionElement);
				}
			});
		}

		async function find() {
			prepareNewTestDiscovery();
			const sTestPage = byId("testPage").value;
			const bSequential = byId("sequential").checked;
			const aTestPages = await discovery.checkTestPage(sTestPage, bSequential);
			toggleDisplay("busy", false);
			globalThis.aTestPages = aTestPages;

			if (aTestPages.length) {
				createTestPageSelectionOptions();

				setVisibile(["run"], true);
				toggleDisplay(["filterElements", "select"], true);
			} else {
				alert(`Testpage ${sTestPage} could not be loaded`); // eslint-disable-line no-alert
			}
		}

		function copyAll() {
			const aSelectedTests = querySelectorAll("#testPageSelect > option");
			const selectedTestsContainer = byId("selectedTests");
			selectedTestsContainer.innerHTML = "";
			for (var i = 0; i < aSelectedTests.length; i++) {
				selectedTestsContainer.appendChild(
					h("option", {value: aSelectedTests[i].textContent}, aSelectedTests[i].textContent)
				);
			}
		}

		function copy(aElements) {
			const selectedTestsContainer = byId("selectedTests");
			const findDuplicates = (option) => {
				return option.label === aElements[i].label;
			};
			for (var i = 0; i < aElements.length; i++) {
				const bElementExists = [...selectedTestsContainer.options].some(findDuplicates);
				if (!bElementExists) {
					selectedTestsContainer.appendChild(
						h("option", {value: aElements[i].textContent}, aElements[i].textContent)
					);
				}
			}
		}

		function removeSelectedTest(aSelectedTests) {
			aSelectedTests.forEach((selectedTest) => {
				selectedTest.remove();
			});
		}

		function run() {
			prepareNewRun();
			globalThis.oStartTime = new Date();
			var aTests = [...querySelectorAll("#selectedTests > option")].map((option) => option.textContent);
			var nStep = 100 / aTests.length;
			setVisibile(["progressSection", "stop"], true);
			testRunner.runTests(aTests, nStep).then(displayTestResults);
		}

		function prepareNewTestDiscovery() {
			setVisibile(["run", "stop"], false);
			toggleDisplay(["filterElements", "select", "test-reporting"], false);
			/**
			 * @deprecated
			 */
			toggleDisplay(["test-coverage"], false);
			byId("filter").value = "";
			removeSelectedTest([...querySelectorAll("#select select > option")]);
			toggleDisplay("busy", true);
		}

		function displayTestResults() {
			const aAreas = ["test-reporting"];

			/**
			 * @deprecated
			 */
			if (testRunner.hasCoverage()) {
				aAreas.push("test-coverage");
				testRunner.reportCoverage(byId("coverageContent"));
				toggleArea("test-coverage", true);
			}
			setVisibile(["progressSection", "stop"], false);
			toggleDisplay(aAreas, true);
			toggleArea("test-reporting", true);
		}

		/**
		 * Setup test runner
		 */
		byId("testPageLabel").textContent = globalThis.location.origin;
		byId("testPage").value = testRunner.getTestPageUrl();

		progressBar = new ProgressBar(byId("bar"));

		byId("filter").addEventListener("keyup", (event) => {
			createTestPageSelectionOptions(event.target.value.trim());
		});
		byId("testPage").addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				find();
			}
		});

		setVisibile(["progressSection", "run", "stop"], false);

		/**
		 * @deprecated
		 */
		querySelector("body > div").appendChild(h("div", { id: "test-coverage", style: { display: "none" }, "class": "test-coverage uiArea expanded" }, [
			h("div", { id: "coverageHeader", "class": "uiAreaHeader"}, [
				h("div", {}, "Test Coverage"),
				h("div", { id: "openCoverage", "class": "expandCollapseBtn"})
			]),
			h("div", { id: "coverageContent", "class": "uiAreaContent"}, [
				h("div", { id: "blanket-main"})
			])
		]));

		/**
		 * Register click handler
		 */
		click("showResults", () => {
			const button = byId("showResults");
			toggleArea("test-reporting", true);
			if (button.value === "Show all results") {
				byId("test-reporting").classList.add("showAll");
				button.value = "Show errors only";
			} else {
				byId("test-reporting").classList.remove("showAll");
				button.value = "Show all results";
			}
		});

		click("find", find);

		click("copy", () => {
			copy([...byId("testPageSelect").selectedOptions]);
		});

		click("copyall", copyAll);

		click("remove", () => {
			removeSelectedTest([...byId("selectedTests").selectedOptions]);
		});

		click("removeall", () => {
			removeSelectedTest([...querySelectorAll("#selectedTests > option")]);
		});

		click("run", () => {
			if (querySelectorAll("#selectedTests > option").length === 0) {
				alert("Please select at least one test to execute"); // eslint-disable-line no-alert
			} else {
				run();
			}
		});

		click("open", () => {
			toggleArea("test-selection");
		});

		click("openReporting", () => {
			toggleArea("test-reporting");
		});

		/**
		 * @deprecated
		 */
		click("openCoverage", () => {
			toggleArea("test-coverage");
		});

		click("stop", testRunner.stopTests.bind(testRunner));

		if (testRunner.getAutoStart()) {
			find().then(function() {
				copyAll();
				run();
			});
		}
	});
}(globalThis));
