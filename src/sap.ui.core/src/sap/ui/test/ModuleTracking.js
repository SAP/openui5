/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global QUnit */
	/*eslint no-alert: 0, no-warning-comments: 0 */

	const oScript = Array.from(document.getElementsByTagName("script"))
		.find((oScript) => /ModuleTracking.js$/.test(oScript.getAttribute("src")));

	function clone(o) {
		return o && JSON.parse(JSON.stringify(o));
	}

	//**********************************************************************************************
	// Code for tracking "Uncaught (in promise)" for sap.ui.base.SyncPromise inside QUnit tests
	//**********************************************************************************************
	var Log,
		sClassName = "sap.ui.base.SyncPromise",
		iNo = 0,
		rSearchParamWithoutValue = /(=)(?=&|$)/g,
		mUncaughtById = {},
		mUncaughtPromise2Reason = new Map();

	/**
	 * Check for uncaught errors in sync promises and provide an appropriate report to the given
	 * optional reporter.
	 *
	 * @param {function} [fnReporter]
	 *   Optional reporter to receive a report
	 */
	function checkUncaught(fnReporter) {
		var sId,
			iLength = Object.keys(mUncaughtById).length
				+ (mUncaughtPromise2Reason ? mUncaughtPromise2Reason.size : 0),
			sMessage = "Uncaught (in promise): " + iLength + " times\n",
			oPromise,
			vReason,
			oResult,
			itValues;

		if (iLength) {
			for (sId in mUncaughtById) {
				oPromise = mUncaughtById[sId];
				if (oPromise.getResult() && oPromise.getResult().stack) {
					sMessage += oPromise.getResult().stack;
				} else {
					sMessage += oPromise.getResult();
				}
				if (oPromise.$error.stack) {
					sMessage += "\n>>> SyncPromise rejected with above reason...\n"
						+ oPromise.$error.stack.split("\n").slice(2).join("\n"); // hide listener
				}
				sMessage += "\n\n";
			}
			mUncaughtById = {};

			//TODO for (let vReason of mUncaughtPromise2Reason.values()) {...}
			if (mUncaughtPromise2Reason && mUncaughtPromise2Reason.size) {
				itValues = mUncaughtPromise2Reason.values();
				for (;;) {
					oResult = itValues.next();
					if (oResult.done) {
						break;
					}
					vReason = oResult.value;
					sMessage += (vReason && vReason.stack || vReason) + "\n\n";
				}
				mUncaughtPromise2Reason.clear();
			}

			if (fnReporter) {
				fnReporter(sMessage);
			} else if (Log) {
				Log.info(`Clearing ${iLength} uncaught promises`, sMessage, sClassName);
			}
		}
	}

	if (oScript.getAttribute("data-uncaught-in-promise") !== "true") {
		/*
		 * Listener for "unhandledrejection" events to keep track of "Uncaught (in promise)".
		 */
		window.addEventListener("unhandledrejection", function (oEvent) {
			if (oEvent.reason && oEvent.reason.$uncaughtInPromise) { // ignore exceptional cases
				return;
			}

			if (mUncaughtPromise2Reason) {
				mUncaughtPromise2Reason.set(oEvent.promise, oEvent.reason);
				oEvent.preventDefault(); // do not report on console
			} else { // QUnit already done
				alert("Uncaught (in promise) " + oEvent.reason);
			}
		});

		/*
		 * Listener for "rejectionhandled" events to keep track of "Uncaught (in promise)".
		 */
		window.addEventListener("rejectionhandled", function (oEvent) {
			if (mUncaughtPromise2Reason) {
				mUncaughtPromise2Reason.delete(oEvent.promise);
			}
		});
	}

	/**
	 * Listener for sync promises which become (un)caught.
	 *
	 * @param {sap.ui.base.SyncPromise} oPromise
	 *   A sync promise
	 * @param {boolean} bCaught
	 *   Tells whether the given sync promise became caught
	 */
	function listener(oPromise, bCaught) {
		if (bCaught) {
			delete mUncaughtById[oPromise.$id];
			if (Log) {
				Log.info(`Promise ${oPromise.$id} caught`,
					Object.keys(mUncaughtById), sClassName);
			}
			return;
		}

		oPromise.$id = iNo++;
		oPromise.$error = new Error();
		mUncaughtById[oPromise.$id] = oPromise;
		if (Log) {
			Log.info(`Promise ${oPromise.$id} rejected with ${oPromise.getResult()}`,
				Object.keys(mUncaughtById), sClassName);
		}
	}

	//**********************************************************************************************
	// Methods dealing with Istanbul
	//**********************************************************************************************

	// the initial coverage per module (identified by resource name), taken when QUnit starts
	let mInitialCoverageByModule;
	const mCoverageSnapshotByModule = {};
	const bTestsFiltered = /(testId|filter)=/.test(window.location.search);

	function filterCoverage() {
		if (window.__coverage__ && Object.keys(mCoverageSnapshotByModule).length) {
			if (window.location.search.includes("moduleId=")) {
				// only keep the coverage for the actually tested modules
				window.__coverage__ = mCoverageSnapshotByModule;
			} else {
				// replace globally measured code coverage by isolated code coverage results
				for (const [sModuleName, oCounts] of Object.entries(mCoverageSnapshotByModule)) {
					setModuleCoverage(sModuleName, oCounts);
				}
			}
		}
	}

	function getResourceName(sModuleName) {
		if (!window.__coverage__) {
			return undefined;
		}
		if (sModuleName.endsWith(".js")) {
			return sModuleName;
		}
		const sPath = `${sModuleName.replace(/\./g, "/")}.js`;
		return Object.keys(window.__coverage__)
			.find((sResourceName) => sResourceName.endsWith(sPath));
	}

	/**
	 * Replaces the current code coverage counts for branches by the given counts.
	 *
	 * @param {object} oCurrent The current branch counts
	 * @param {object} oCounts The branch counts to be used
	 */
	function setBranchCounts(oCurrent, oCounts) {
		const oCurrentBranchCounts = oCurrent.b;
		const oBranchCounts = oCounts.b;
		for (const [sKey, aInitialCounts] of Object.entries(oBranchCounts)) {
			const aCurrentCounts = oCurrentBranchCounts[sKey];
			aInitialCounts.forEach((iCount, i) => { aCurrentCounts[i] = iCount; });
		}
	}

	/**
	 * Replaces the current code coverage counts by the given counts.
	 *
	 * @param {object} oCurrentCounts The current counts
	 * @param {object} oCounts The counts to be used
	 */
	function setCounts(oCurrentCounts, oCounts) {
		for (const [sKey, iCount] of Object.entries(oCounts)) {
			oCurrentCounts[sKey] = iCount;
		}
	}

	/**
	 * Sets the measured counts to the given values, or to the initial values if isolated counts
	 * are not set.
	 *
	 * @param {string} sModuleName
	 *   The module name
	 * @param {object} [oIsolatedCounts]
	 *   The measured isolated counts; if not given the initial counts are used
	 */
	function setModuleCoverage(sModuleName, oIsolatedCounts) {
		const sResourceName = getResourceName(sModuleName);
		if (sResourceName) {
			const oGlobalCounts = window.__coverage__[sResourceName];
			const oCounts = oIsolatedCounts || mInitialCoverageByModule[sResourceName];
			setBranchCounts(oGlobalCounts, oCounts);
			setCounts(oGlobalCounts.f, oCounts.f);
			setCounts(oGlobalCounts.s, oCounts.s);
		}
	}

	function saveInitialCoverage() {
		// the coverage from the module loading
		mInitialCoverageByModule = clone(window.__coverage__);
	}

	/**
	 * Takes a snapshot and verify that all branches, statements and functions are covered.
	 *
	 * @param {string} sModuleName - The module name
	 * @returns {boolean} Whether the coverage is bad
	 */
	function handleModuleCoverage(sModuleName) {
		const sResourceName = getResourceName(sModuleName);
		if (!sResourceName) {
			return false;
		}
		const oCoverage = clone(window.__coverage__[sResourceName]);
		mCoverageSnapshotByModule[sResourceName] = oCoverage;
		if (bTestsFiltered) {
			return false;
		}
		return Object.values(oCoverage.b).some((aCounts) => aCounts.some((iCount) => iCount === 0))
			|| Object.values(oCoverage.f).some((iCount) => iCount === 0)
			|| Object.values(oCoverage.s).some((iCount) => iCount === 0);
	}

	//**********************************************************************************************
	// Intercept QUnit
	// Each module shall only be covered when its own tests run. For this purpose we keep the
	// initial module states. When a module is started, we revert its coverage to the initial state.
	// When it's finished we take a snapshot. In the end we only keep the snapshots.
	//**********************************************************************************************

	const fnModule = QUnit.module.bind(QUnit);

	/**
	 * Wrapper for <code>QUnit.module</code> to check for uncaught errors in sync promises and
	 * for 100% isolated test coverage.
	 *
	 * @param {string} sTitle
	 *   The module's title
	 * @param {object} [mHooks]
	 *   Optional map of hooks, e.g. "beforeEach"
	 */
	function module(sTitle, mHooks) {
		mHooks = mHooks || {};
		const fnAfter = mHooks.after || function () {};
		const fnAfterEach = mHooks.afterEach || function () {};
		const fnBefore = mHooks.before || function () {};
		const fnBeforeEach = mHooks.beforeEach || function () {};

		mHooks.after = function (assert) {
			if (!this.__ignoreIsolatedCoverage__ && handleModuleCoverage(sTitle)) {
				assert.ok(false, `${sTitle}: Coverage below 100%`);
			}

			return fnAfter.apply(this, arguments);
		};

		mHooks.afterEach = function (assert) {
			const fnCheckUncaught = checkUncaught.bind(null, assert.ok.bind(assert, false));

			function error(oError) {
				fnCheckUncaught();
				throw oError;
			}

			function success(vResult) {
				if (vResult && typeof vResult.then === "function") {
					return vResult.then(success, error);
				}
				fnCheckUncaught();
				return vResult;
			}

			try {
				return success(fnAfterEach.apply(this, arguments));
			} catch (oError) {
				return error(oError);
			}
		};

		mHooks.before = function () {
			const oResult = fnBefore.apply(this, arguments);
			if (!this.__ignoreIsolatedCoverage__) {
				setModuleCoverage(sTitle);
			}
			return oResult;
		};

		mHooks.beforeEach = function () {
			checkUncaught(); // cleans up what happened before
			return fnBeforeEach.apply(this, arguments);
		};

		fnModule(sTitle, mHooks);
	}

	if (QUnit.module !== module) {
		QUnit.module = module;
		sap.ui.require([
			"sap/base/Log",
			"sap/ui/base/SyncPromise"
		], function (Log0, SyncPromise) {
			if (Log0.isLoggable(Log0.Level.INFO, sClassName)) {
				Log = Log0;
			}
			SyncPromise.listener = listener;
		});

		QUnit.begin(() => {
			// allow easier module selection: larger list, one click selection
			document.body.style.overflow = "scroll"; // always show scrollbar, avoid flickering
			document.getElementById("qunit-modulefilter-dropdown-list").style.maxHeight = "none";

			document.getElementById("qunit-modulefilter-dropdown")
				.addEventListener("click", function (oMouseEvent) {
					if (oMouseEvent.target.tagName === "LABEL"
							&& oMouseEvent.target.innerText !== "All modules") {
						setTimeout(function () {
							// click on label instead of checkbox triggers "Apply" automatically
							document.getElementById("qunit-modulefilter-actions").firstChild
								.dispatchEvent(new MouseEvent("click"));
						});
					}
				});

			const oParams = new URLSearchParams(document.location.search);

			// add a button to clear the filter
			if (oParams.has("filter")) {
				const oClearFilter = document.createElement("button");

				oClearFilter.type = "button";
				oClearFilter.innerText = "\u2715"; // X
				oClearFilter.addEventListener("click", (ev) => {
					oParams.delete("filter");
					document.location.search = oParams.toString()
						.replace(rSearchParamWithoutValue, '');

				});
				document.querySelector(".qunit-filter button")
					.insertAdjacentElement("beforeBegin", oClearFilter);
			}

			// Add a hover effect to buttons (colors inspired by QUnit's own CSS)
			const oStyle = document.createElement('style');
			oStyle.innerText = `
				button:hover {
					background-color: #DDD !important;
				}
				button:focus {
					box-shadow: 0 0 0 2px rgba(94, 116, 11, 0.5) !important;
				}
			`;
			document.head.appendChild(oStyle);

			// remember which lines have been covered initially, at load time
			saveInitialCoverage();
		});

		QUnit.done(() => {
			filterCoverage();

			// "Run all tests" in "Rerunning selected tests" case: Same href as document, but remove
			// testId
			const oParams = new URLSearchParams(document.location.search);
			if (oParams.has("moduleId")) {
				const oClearFilter = document.querySelector("#qunit-clearFilter");
				if (oClearFilter) {
					oParams.delete("testId");
					const oRunModulesURL = new URL(document.location.href);
					oRunModulesURL.search = oParams.toString()
						.replace(rSearchParamWithoutValue, '');
					oClearFilter.href = oRunModulesURL;
				}
			}
		});
	}
}());
