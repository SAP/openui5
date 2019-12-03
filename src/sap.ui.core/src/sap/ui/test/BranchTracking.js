/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global _$blanket, blanket, falafel, Map, QUnit */
	/*eslint no-alert: 0, no-warning-comments: 0 */

	var aFileNames = [], // maps a file's index to its name
		oScript = getScriptTag(),
		aStatistics = [], // maps a file's index to its "hits" array (and statistics record)
		iThreshold,
		rWordChar = /\w/; // a "word" (= identifier) character

	/**
	 * Keep track of branch coverage.
	 *
	 * @param {number} iFileIndex
	 *   The current file's index
	 * @param {number} iBranchIndex
	 *   The current branch's index
	 * @param {any} vCondition
	 *   The current branch's condition
	 * @param {number} [iLine]
	 *   The current branch's line number (for statement coverage)
	 * @returns {any}
	 *   <code>vCondition</code>
	 */
	function branchTracking(iFileIndex, iBranchIndex, vCondition, iLine) {
		if (iBranchIndex >= 0) {
			if (vCondition) {
				aStatistics[iFileIndex].branchTracking[iBranchIndex].truthy += 1;
			} else {
				aStatistics[iFileIndex].branchTracking[iBranchIndex].falsy += 1;
			}
		}

		if (iLine >= 0) {
			lineTracking(iFileIndex, iLine);
		}

		return vCondition;
	}

	/**
	 * Returns the element's attribute as an integer.
	 *
	 * @param {Element} oElement The element
	 * @param {string} sAttributeName The attribute name
	 * @param {number} iDefault The default value
	 * @returns {number} The attribute value or the default value if the attribute value is not a
	 *   positive number
	 */
	function getAttributeAsInteger(oElement, sAttributeName, iDefault) {
		var iValue = parseInt(oElement.getAttribute(sAttributeName));

		// Note: if the value is not a number, the result is NaN which is not greater than 0
		return iValue > 0 ? iValue : iDefault;
	}

	/**
	 * Determines the script tag that loaded this script.
	 *
	 * @return {Element}
	 *   The script tag that loaded this script
	 */
	function getScriptTag() {
		var oScript,
			aScripts = document.getElementsByTagName("script"),
			i, n;

		for (i = 0, n = aScripts.length; i < n; i += 1) {
			oScript = aScripts[i];

			if (/BranchTracking.js$/.test(oScript.getAttribute("src"))) {
				return oScript;
			}
		}
	}

	/**
	 * Replacement for Blanket.js' <code>instrument</code> function.
	 *
	 * @param {object} oConfiguration
	 *   Configuration object
	 * @param {string} oConfiguration.inputFile
	 *   The current file's original source code
	 * @param {string} oConfiguration.inputFileName
	 *   The current file's name
	 * @param {function} fnSuccess
	 *   Success handler, called with resulting instrumented source code
	 */
	function instrument(oConfiguration, fnSuccess){
		var bBranchTracking = blanket.options("branchTracking"),
			bComment = false, // interested in meta comments?
			Device,
			iFileIndex = aFileNames.length,
			sFileName = oConfiguration.inputFileName,
			iNoOfOutputLines,
			sScriptInput = oConfiguration.inputFile,
			sScriptOutput;

		if (sScriptInput.indexOf("// sap-ui-cover-browser msie") >= 0) {
			bComment = true; // needed by isDeviceSpecificBlock(), no matter which device
			Device = sap.ui.require("sap/ui/Device");
			if (Device && Device.browser.msie) {
				// no need to call isChildOfIgnoredNode()
				Device = undefined;
			}
		}
		aFileNames.push(sFileName);
		aStatistics[iFileIndex] = _$blanket[sFileName] = []; // hits
		if (bBranchTracking) {
			_$blanket[sFileName].branchTracking = [];
		}
		_$blanket[sFileName].source = sScriptInput.split("\n");
		_$blanket[sFileName].source.unshift(""); // line 0 does not exist!
		_$blanket[sFileName].warnings = [];

		sScriptOutput = "" + falafel(sScriptInput, {
				attachComment : bComment,
				comment : bComment,
				loc : true,
				range : true,
				source : sScriptInput // is simply attached to each Location
//				tokens : false,
//				tolerant : false
			}, visit.bind(null, bBranchTracking, iFileIndex, Device));

		iNoOfOutputLines = sScriptOutput.split("\n").length + 1; // account for line 0 here as well
		if (iNoOfOutputLines !== _$blanket[sFileName].source.length) {
			warn(sFileName, "Line length mismatch! " + _$blanket[sFileName].source.length + " vs. "
				+ iNoOfOutputLines);
		}

		fnSuccess(sScriptOutput);
	}

	/**
	 * Returns whether the given node or one of its ancestors is device-specific for a device
	 * other than what the given <code>Device</code> indicates.
	 *
	 * @param {sap.ui.Device} Device
	 *   Device
	 * @param {object} oNode
	 *   AST node
	 * @returns {boolean}
	 *   Whether the given node or one of its ancestors is device-specific for another device
	 */
	function isChildOfIgnoredNode(Device, oNode) {
		if (!("$ignored" in oNode)) {
			if (oNode.parent && isChildOfIgnoredNode(Device, oNode.parent)) {
				oNode.$ignored = true;
			} else { // ignore device-specific code on other devices
				oNode.$ignored = oNode.type === "BlockStatement"
					&& isDeviceSpecificBlock(Device, oNode);
			}
		}
		return oNode.$ignored;
	}

	/**
	 * Returns whether the given block statement node is device-specific (in general, or for a
	 * device other than what the given <code>Device</code> indicates).
	 *
	 * @param {sap.ui.Device} [Device]
	 *   Optional device API; without it, the meta comment alone counts
	 * @param {object} oNode
	 *   AST node
	 * @returns {boolean}
	 *   Whether the given block statement node is device-specific for another device
	 */
	function isDeviceSpecificBlock(Device, oNode) {
		/*
		 * Tells whether the given comment is a meta comment for device-specific code (in general,
		 * if no <code>Device</code> is available, or for a device other than what the available
		 * <code>Device</code> indicates).
		 *
		 * @param {string} oComment
		 *   A single block or end-of-line comment
		 * @returns {boolean}
		 *   Whether the given comment is a meta comment for device-specific code (see above)
		 */
		function isNotForDevice(oComment) {
			return oComment.type === "Line" && oComment.value === " sap-ui-cover-browser msie"
				&& !(Device && Device.browser.msie);
		}

		return oNode.body[0] && oNode.body[0].leadingComments
			&& oNode.body[0].leadingComments.some(isNotForDevice);
	}

	/**
	 * Keep track of statement coverage.
	 *
	 * @param {number} iFileIndex
	 *   The current file's index
	 * @param {number} iLine
	 *   The current line number
	 */
	function lineTracking(iFileIndex, iLine) {
		aStatistics[iFileIndex][iLine] += 1;
	}

	/**
	 * Visit the given node, maybe instrument it.
	 *
	 * Note: "The recursive walk is a pre-traversal, so children get called before their parents."
	 *
	 * Note: We make no attempt to check that the global variable <code>blanket</code> is not
	 * redefined. We don't rely on <code>window</code>. No support for labeled statements
	 * (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label).
	 * We rely on ESLint, e.g. http://eslint.org/docs/rules/curly.
	 *
	 * @param {boolean} bBranchTracking
	 *   Whether branch tracking is on
	 * @param {number} iFileIndex
	 *   The current file's index
	 * @param {sap.ui.Device} [Device]
	 *   Device
	 * @param {object} oNode
	 *   AST node
	 * @returns {boolean}
	 *   Whether <code>oNode.update()</code> has been used (Note: works only once!). This is just
	 *   meant to keep track for future internal usage and is actually ignored by Falafel's
	 *   <code>walk</code>.
	 */
	function visit(bBranchTracking, iFileIndex, Device, oNode) {
		var aHits = aStatistics[iFileIndex],
			aBranchTracking = aHits.branchTracking,
			iLine = oNode.loc.start.line,
			sNewSource;

		/*
		 * Adds line tracking instrumentation to the current node.
		 *
		 * @returns {boolean}
		 *   <code>true</code> because <code>oNode.update()</code> has been used
		 */
		function addLineTracking() {
			oNode.update("blanket.$l(" + iFileIndex + ", " + iLine + "); " + oNode.source());
			initHits();
			return true;
		}

		/*
		 * Initialize hits count for current line, double check for duplicates.
		 */
		function initHits() {
			if (iLine in aHits) {
				warn(iFileIndex, "Multiple statements on same line detected"
					+ " – minified code not supported! Line number " + iLine);
			}
			aHits[iLine] = 0;
		}

		/*
		 * Preserve operator's source code incl. comments and line breaks, but avoid leading closing
		 * or trailing opening parentheses.
		 *
		 * Note: outer parentheses are absorbed by operators and do not appear in operand's source!
		 *
		 * @returns {string}
		 */
		function operator() {
			var sSource = oNode.loc.source.slice(oNode.left.range[1], oNode.right.range[0]);

			if (sSource[0] === ")") {
				sSource = sSource.slice(1);
			}
			if (sSource.slice(-1) === "(") {
				sSource = sSource.slice(0, -1);
			}

			return sSource;
		}

		if (Device && isChildOfIgnoredNode(Device, oNode)) {
			return false;
		}

		switch (oNode.type) {
			case "FunctionDeclaration":
			case "FunctionExpression":
				if (oNode.body.body[0] && iLine === oNode.body.body[0].loc.start.line) {
					warn(iFileIndex, "Function body must not start on same line! Line number "
						+ iLine);
//					aHits[iLine] = NaN; //TODO find an easy way to mark this line as "missed"
				}
				break;

			default:
		}

		switch (oNode.type) {
			case "AssignmentExpression":
			case "ArrayExpression":
			case "BlockStatement":
			case "BinaryExpression":
			case "Block": // block comment
			case "CallExpression":
			case "CatchClause": //TODO coverage for empty blocks?
			case "DebuggerStatement":
			case "EmptyStatement": //TODO coverage?!
			case "FunctionExpression":
			case "Identifier":
			case "Line": // end-of-line comment
			case "Literal":
			case "MemberExpression":
			case "NewExpression":
			case "ObjectExpression":
			case "Program":
			case "Property":
			case "SequenceExpression":
			case "SwitchCase": //TODO (statement) coverage!
			case "ThisExpression":
			case "UnaryExpression":
			case "UpdateExpression":
			case "VariableDeclarator":
				return false;

			case "ConditionalExpression":
				if (!bBranchTracking) {
					return false;
				}
				oNode.test.update("blanket.$b(" + iFileIndex + ", " + aBranchTracking.length + ", "
					+ oNode.test.source() + ")"
				);
				aBranchTracking.push({
					alternate : oNode.alternate.loc,
					consequent : oNode.consequent.loc,
					falsy : 0,
					truthy : 0
				});
				return true;

			case "ExpressionStatement":
				if (oNode.expression.type === "Literal"
					&& oNode.expression.value === "use strict") {
					return false; // do not instrument "use strict"; it would break it!
				}
				// fall through
			case "DoWhileStatement":
			case "ForInStatement":
			case "ForStatement":
			case "WhileStatement":
			case "WithStatement":
				// Note: we assume block statements only (@see blanket._blockifyIf)
			case "BreakStatement":
			case "ContinueStatement":
			case "FunctionDeclaration":
			case "ReturnStatement":
			case "SwitchStatement":
			case "ThrowStatement":
			case "TryStatement":
				return addLineTracking(oNode);

			case "IfStatement":
				if (isDeviceSpecificBlock(undefined, oNode.consequent)) {
					// Note: if "then" is device-specific, we cannot expect branch coverage of "if"
					bBranchTracking = false;
				}
				// Note: we assume block statements only (@see blanket._blockifyIf)
				oNode.test.update("blanket.$b(" + iFileIndex + ", "
					+ (bBranchTracking ? aBranchTracking.length : -1) + ", "
					+ oNode.test.source() + ", " + iLine + ")"
				);
				initHits();
				if (bBranchTracking) {
					aBranchTracking.push({
						// Note: in case of missing "else" we blame it on the condition
						alternate : (oNode.alternate || oNode.test).loc,
						consequent : oNode.consequent.loc,
						falsy : 0,
						truthy : 0
					});
				} // else would like to fall through to line tracking, but that does not work for
				// "else if" unless s.th. like blanket._blockifyIf is used!
				return true;

			case "LogicalExpression":
				if (!bBranchTracking) {
					return false;
				}
				if (oNode.operator === "||" || oNode.operator === "&&") {
					// Note: (...) around right source!
					sNewSource = "blanket.$b(" + iFileIndex + ", " + aBranchTracking.length + ", "
						+ oNode.left.source() + ") "
						+ operator() + " (" + oNode.right.source() + ")";
					if (!rWordChar.test(oNode.loc.source[oNode.range[0]])) {
						// Note: handle minified code like "return!x||y;"
						sNewSource = " " + sNewSource;
					}
					oNode.update(sNewSource);
					aBranchTracking.push({
						alternate : oNode.operator === "&&"
							? oNode.left.loc
							: oNode.right.loc,
						consequent : oNode.operator === "&&"
							? oNode.right.loc
							: oNode.left.loc,
						falsy : 0,
						truthy : 0
					});
				}
				return true;

			case "VariableDeclaration":
				if (oNode.parent.type === "ForInStatement"
					|| oNode.parent.type === "ForStatement") {
					return false;
				}
				return addLineTracking(oNode);

			case "LabeledStatement":
			default:
				throw new Error(oNode.source());
		}
	}

	/**
	 * Logs the given message related to the given file both as a warning on console and as a
	 * warning to be reported inside QUnit.module's "before" hook.
	 *
	 * @param {number|string} vFile - the affected file's index or name
	 * @param {string} sMessage - a message
	 */
	function warn(vFile, sMessage) {
		var sFileName = typeof vFile === "string"
				? vFile
				: aFileNames[vFile];

		jQuery.sap.log.warning(sMessage, sFileName, "sap.ui.test.BranchTracking");
		_$blanket[sFileName].warnings.push(sMessage);
	}

	/**
	 * Listens on QUnit and delivers a function that returns the tested modules.
	 *
	 * @returns {function} A function that delivers the tested modules or <code>undefined</code> if
	 *   all modules have been tested
	 */
	function listenOnQUnit() {
		var mModules = {},
			aTestedModules = [],
			iTotalModules;

		QUnit.begin(function (oDetails) {
			iTotalModules = oDetails.modules.length;
			oDetails.modules.forEach(function (oModule) {
				mModules[oModule.name] = oModule;
			});
		});

		QUnit.moduleStart(function (oModule) {
			// Why, oh why, is the module name different here?
			aTestedModules = aTestedModules.concat(
				Object.keys(mModules).filter(function (sModuleName) {
					return mModules[sModuleName].tests === oModule.tests;
				})
			);
		});

		return function () {
			return aTestedModules.length < iTotalModules ? aTestedModules : undefined;
		};
	}

	if (window.blanket) {
		window._$blanket = {}; // maps a file's name to its statistics array
		blanket.$b = branchTracking;
		blanket.$l = lineTracking;
		blanket.instrument = instrument; // self-made "plug-in" ;-)

		var fnGetTestedModules = listenOnQUnit(),
			iLinesOfContext = getAttributeAsInteger(oScript, "data-lines-of-context", 3);

		iThreshold = Math.min(getAttributeAsInteger(oScript, "data-threshold", 0), 100);

		// Note: instrument() MUST have been replaced before!
		sap.ui.require(["sap/ui/test/BlanketReporter"], function (BlanketReporter) {
			blanket.options("reporter",
				BlanketReporter.bind(null, iLinesOfContext, iThreshold, fnGetTestedModules));
		});
	}

	//**********************************************************************************************
	// Code for tracking "Uncaught (in promise)" for sap.ui.base.SyncPromise inside QUnit tests
	// and for checking isolated code coverage (that is, each "class" by its corresponding test)
	//**********************************************************************************************
	var bInfo,
		sClassName = "sap.ui.base.SyncPromise",
		mFileName2InitialHits = {},
		fnModule,
		iNo = 0,
		sTestId,
		mUncaughtById = {},
		mUncaughtPromise2Reason = new Map();

	/**
	 * Check isolated line/branch coverage for the given test.
	 *
	 * @param {object} oTest - QUnit's test environment
	 * @param {object} assert - QUnit's object with the assertion methods
	 */
	function checkIsolatedCoverage(oTest, assert) {
		var aBranchesWithUnchangedHits,
			aHits = _$blanket[oTest.$currentFileName],
			aInitialHits = mFileName2InitialHits[oTest.$currentFileName],
			aLinesWithUnchangedHits;

		if (oTest.$oldHits) {
			aLinesWithUnchangedHits = Object.keys(aHits).filter(function (iLine) {
				return !(aInitialHits && aInitialHits[iLine])
					&& aHits[iLine] === oTest.$oldHits[iLine];
			});
			assert.notOk(aLinesWithUnchangedHits.length,
				"Some lines have not been covered by this module in isolation: "
					+ aLinesWithUnchangedHits);
		}
		if (oTest.$oldBranchTracking) {
			aBranchesWithUnchangedHits = Object.keys(aHits.branchTracking).filter(function (i) {
				return aHits.branchTracking[i].falsy === oTest.$oldBranchTracking[i].falsy
					|| aHits.branchTracking[i].truthy === oTest.$oldBranchTracking[i].truthy;
			});
			assert.notOk(aBranchesWithUnchangedHits.length,
				"Some branches have not been fully covered by this module in isolation: "
					+ aBranchesWithUnchangedHits);
		}
	}

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

			//TODO once IE is gone: for (let vReason of mUncaughtPromise2Reason.values()) {...}
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
			} else if (bInfo) {
				jQuery.sap.log.info("Clearing " + iLength + " uncaught promises", sMessage,
					sClassName);
			}
		}
	}

	if (oScript.getAttribute("data-uncaught-in-promise") !== "true") {
		/*
		 * Listener for "unhandledrejection" events to keep track of "Uncaught (in promise)".
		 */
		window.addEventListener("unhandledrejection", function (oEvent) {
			if (oEvent.reason.$uncaughtInPromise) { // ignore exceptional cases
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
			if (bInfo) {
				jQuery.sap.log.info("Promise " + oPromise.$id + " caught",
					Object.keys(mUncaughtById), sClassName);
			}
			return;
		}

		oPromise.$id = iNo++;
		oPromise.$error = new Error();
		mUncaughtById[oPromise.$id] = oPromise;
		if (bInfo) {
			jQuery.sap.log.info("Promise " + oPromise.$id + " rejected with "
				+ oPromise.getResult(), Object.keys(mUncaughtById), sClassName);
		}
	}

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
		var fnAfter, fnAfterEach, fnBefore, fnBeforeEach;

		mHooks = mHooks || {};
		fnAfter = mHooks.after || function () {};
		fnAfterEach = mHooks.afterEach || function () {};
		fnBefore = mHooks.before || function () {};
		fnBeforeEach = mHooks.beforeEach || function () {};

		mHooks.after = function (assert) {
			if (window.blanket && !sTestId && !this.__ignoreIsolatedCoverage__
					&& iThreshold >= 100) {
				checkIsolatedCoverage(this, assert);
			}

			return fnAfter.apply(this, arguments);
		};

		mHooks.afterEach = function (assert) {
			var fnCheckUncaught = checkUncaught.bind(null, assert.ok.bind(assert, false));

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
				error(oError);
			}
		};

		mHooks.before = function (assert) {
			var aHits;

			this.$currentFileName = jQuery.sap.getResourceName(assert.test.module.name);
			aHits = window.blanket && _$blanket[this.$currentFileName];
			if (aHits) {
				this.$oldHits = aHits.slice();
				if (aHits.branchTracking) {
					this.$oldBranchTracking = JSON.parse(
						JSON.stringify(aHits.branchTracking, ["falsy", "truthy"]));
				}
				aHits.warnings.forEach(function (sMessage) {
					assert.ok(false, sMessage);
				});
			}

			return fnBefore.apply(this, arguments);
		};

		mHooks.beforeEach = function (assert) {
			checkUncaught(); // cleans up what happened before
			return fnBeforeEach.apply(this, arguments);
		};

		fnModule(sTitle, mHooks);
	}

	if (QUnit.module !== module) {
		fnModule = QUnit.module.bind(QUnit);
		QUnit.module = module;
		sap.ui.require([
			"sap/base/Log",
			"sap/base/util/UriParameters",
			"sap/ui/base/SyncPromise"
		], function (Log, UriParameters, SyncPromise) {
			bInfo = Log.isLoggable(Log.Level.INFO, sClassName);
			sTestId = UriParameters.fromQuery(window.location.search).get("testId");
			SyncPromise.listener = listener;
		});

		// allow easier module selection: larger list, one click selection
		QUnit.begin(function () {
			var sFileName, aHits;

			jQuery("#qunit-modulefilter-dropdown-list").css("max-height", "none");

			jQuery("#qunit-modulefilter-dropdown").click(function (oMouseEvent) {
				if (oMouseEvent.target.tagName === "LABEL") {
					setTimeout(function () {
						// click on label instead of checkbox triggers "Apply" automatically
						jQuery("#qunit-modulefilter-actions").children().first().click();
					});
				}
			});

			if (window.blanket) {
				// remember which lines have been covered initially, at load time
				for (sFileName in _$blanket) {
					aHits = _$blanket[sFileName];
					mFileName2InitialHits[sFileName] = aHits.slice();
				}
				// Note: for SyncPromise, a lot of lines are already covered!
			}
		});

		QUnit.done(function () {
			mUncaughtPromise2Reason = null; // no use to keep track anymore
		});
	}
}());
//TODO add tooltips to highlighting to explain rules

