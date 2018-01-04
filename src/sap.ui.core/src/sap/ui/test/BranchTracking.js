/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global _$blanket, blanket, falafel */

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
			iFileIndex = aFileNames.length,
			sFileName = oConfiguration.inputFileName,
			sScriptInput = oConfiguration.inputFile,
			sScriptOutput;

		aFileNames.push(sFileName);
		aStatistics[iFileIndex] = _$blanket[sFileName] = []; // hits
		if (bBranchTracking) {
			_$blanket[sFileName].branchTracking = [];
		}
		_$blanket[sFileName].source = sScriptInput.split("\n");

		sScriptOutput = "" + falafel(sScriptInput, {
//				attachComment : true, // interesting for meta comments!
//				comment : true,
				loc : true
//				range : false,
//				source : undefined, // would simply be attached to each Location
//				tokens : false,
//				tolerant : false
			}, visit.bind(null, bBranchTracking, iFileIndex));

		fnSuccess(sScriptOutput);
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
	 * Note: We make no attempt to check that the global variable <code>blanket</code> is not
	 * redefined. We don't rely on <code>window</code>. No support for labeled statements
	 * (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label).
	 * We rely on ESLint, e.g. http://eslint.org/docs/rules/curly.
	 *
	 * @param {boolean} bBranchTracking
	 *   Whether branch tracking is on
	 * @param {number} iFileIndex
	 *   The current file's index
	 * @param {object} oNode
	 *   AST node
	 * @returns {boolean}
	 *   Whether <code>oNode.update()</code> has been used (Note: works only once!).
	 */
	function visit(bBranchTracking, iFileIndex, oNode) {
		var aHits = aStatistics[iFileIndex],
			aBranchTracking = aHits.branchTracking,
			iLine = oNode.loc.start.line,
			sNewSource,
			sOldSource;

		function addLineTracking(oNode) {
			oNode.update("blanket.$l(" + iFileIndex + ", " + iLine + "); " + oNode.source());
			aHits[iLine] = 0;
			return true;
		}

		switch (oNode.type) {
			case "AssignmentExpression":
			case "ArrayExpression":
			case "BlockStatement":
			case "BinaryExpression":
			case "CallExpression":
			case "CatchClause": //TODO coverage for empty blocks?
			case "DebuggerStatement":
			case "EmptyStatement": //TODO coverage?!
			case "FunctionExpression":
			case "Identifier":
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

			case "DoWhileStatement":
			case "ForInStatement":
			case "ForStatement":
			case "WhileStatement":
			case "WithStatement":
				// Note: we assume block statements only (@see blanket._blockifyIf)
			case "BreakStatement":
			case "ContinueStatement":
			case "ExpressionStatement":
			case "FunctionDeclaration":
			case "ReturnStatement":
			case "SwitchStatement":
			case "ThrowStatement":
			case "TryStatement":
				return addLineTracking(oNode);

			case "IfStatement":
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

	if (window.blanket) {
		window._$blanket = {}; // maps a file's name to its statistics array
		blanket.$b = branchTracking;
		blanket.$l = lineTracking;
		blanket.instrument = instrument; // self-made "plug-in" ;-)

		// Note: instrument() MUST have been replaced before!
		sap.ui.require(["sap/ui/test/BlanketReporter"], function (BlanketReporter) {
			blanket.options("reporter", BlanketReporter.bind(null, getScriptTag()));
		});
	}
}());
//TODO add tooltips to highlighting to explain rules