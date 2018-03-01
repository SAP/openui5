/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global _$blanket, blanket, falafel, QUnit */
	/*eslint no-warning-comments: 0 */

	var aFileNames = [], // maps a file's index to its name
		aStatistics = [], // maps a file's index to its "hits" array (and statistics record)
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
				aStatistics[iFileIndex].branchTracking[iBranchIndex].truthy = true;
			} else {
				aStatistics[iFileIndex].branchTracking[iBranchIndex].falsy = true;
			}
		}

		if (iLine >= 0) {
			lineTracking(iFileIndex, iLine);
		}

		return vCondition;
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

		sScriptOutput = "" + falafel(sScriptInput, {
				attachComment : bComment,
				comment : bComment,
				loc : true
//				range : false,
//				source : undefined, // would simply be attached to each Location
//				tokens : false,
//				tolerant : false
			}, visit.bind(null, bBranchTracking, iFileIndex, Device));

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

		return oNode.body[0].leadingComments
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
			sNewSource,
			sOldSource;

		/*
		 * Adds line tracking instrumentation to the current node.
		 *
		 * @returns {boolean}
		 *   <code>true</code> because <code>oNode.update()</code> has been used
		 */
		function addLineTracking() {
			oNode.update("blanket.$l(" + iFileIndex + ", " + iLine + "); " + oNode.source());
			aHits[iLine] = 0;
			return true;
		}

		if (Device && isChildOfIgnoredNode(Device, oNode)) {
			return false;
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
					consequent : oNode.consequent.loc
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
				aHits[iLine] = 0;
				if (bBranchTracking) {
					aBranchTracking.push({
						// Note: in case of missing "else" we blame it on the condition
						alternate : (oNode.alternate || oNode.test).loc,
						consequent : oNode.consequent.loc
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
					sOldSource = oNode.left.source();
					sNewSource = "blanket.$b(" + iFileIndex + ", " + aBranchTracking.length + ", "
						+ sOldSource + ") " + oNode.operator + " (" + oNode.right.source() + ")";
					if (!rWordChar.test(sOldSource[0])) {
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
							: oNode.left.loc
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

		var fnGetTestedModules = listenOnQUnit();

		// Note: instrument() MUST have been replaced before!
		sap.ui.require(["sap/ui/test/BlanketReporter"], function (BlanketReporter) {
			blanket.options("reporter",
				BlanketReporter.bind(null, getScriptTag(), fnGetTestedModules));
		});
	}

	//**********************************************************************************************
	// Code for tracking "Uncaught (in promise)" for sap.ui.base.SyncPromise inside QUnit tests
	//**********************************************************************************************
	var bDebug,
		sClassName = "sap.ui.base.SyncPromise",
		fnModule,
		iNo = 0,
		mUncaughtById = {};

	/**
	 * Check for uncaught errors in sync promises and provide an appropriate report to the given
	 * optional reporter.
	 *
	 * @param {function} [fnReporter]
	 *   Optional reporter to receive a report
	 */
	function checkUncaught(fnReporter) {
		var sId,
			iLength = Object.keys(mUncaughtById).length,
			sMessage = "Uncaught (in promise): " + iLength + " times\n",
			oPromise;

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
			if (fnReporter) {
				fnReporter(sMessage);
			} else if (bDebug) {
				jQuery.sap.log.debug("Clearing " + iLength + " uncaught promises", sMessage,
					sClassName);
			}
		}
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
			if (bDebug) {
				jQuery.sap.log.debug("Promise " + oPromise.$id + " caught",
					Object.keys(mUncaughtById), sClassName);
			}
			return;
		}

		oPromise.$id = iNo++;
		oPromise.$error = new Error();
		mUncaughtById[oPromise.$id] = oPromise;
		if (bDebug) {
			jQuery.sap.log.debug("Promise " + oPromise.$id + " rejected with "
				+ oPromise.getResult(), Object.keys(mUncaughtById), sClassName);
		}
	}

	/**
	 * Wrapper for <code>QUnit.module</code> to check for uncaught errors in sync promises.
	 *
	 * @param {string} sTitle
	 *   The module's title
	 * @param {object} [mHooks]
	 *   Optional map of hooks, e.g. "beforeEach"
	 */
	function module(sTitle, mHooks) {
		var fnAfterEach, fnBeforeEach;

		mHooks = mHooks || {};
		fnAfterEach = mHooks.afterEach || function () {};
		fnBeforeEach = mHooks.beforeEach || function () {};

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

		mHooks.beforeEach = function () {
			checkUncaught(); // cleans up what happened before
			return fnBeforeEach.apply(this, arguments);
		};

		fnModule(sTitle, mHooks);
	}

	if (QUnit && QUnit.module !== module) {
		fnModule = QUnit.module.bind(QUnit);
		QUnit.module = module;
		sap.ui.require(["sap/ui/base/SyncPromise", "jquery.sap.global"], function (SyncPromise) {
			bDebug = jQuery.sap.log.isLoggable(jQuery.sap.log.Level.DEBUG, sClassName);
			SyncPromise.listener = listener;
		});

		QUnit.config.autostart = false;
		sap.ui.require(["sap/ui/core/Core"], function (Core) {
			var oCore = sap.ui.getCore();

			oCore.attachInit(function () {
				function start() {
					try {
						QUnit.start();
					} catch (ex) {
						// no way to tell if QUnit.start() has already been called :-(
					}
				}

				if (oCore.isThemeApplied()) {
					start();
				} else {
					oCore.attachThemeChanged(start);
				}
			});
		});
	}
}());
//TODO add tooltips to highlighting to explain rules

