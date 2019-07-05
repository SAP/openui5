/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterType",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/UriParameters",
	"sap/base/security/encodeXML"
], function (jQuery, Controller, XMLView, Filter, FilterType, JSONModel, UriParameters, encodeXML) {
	"use strict";

	// lower case package names, UpperCamelCase class name, optional lowerCamelCase method name
	// 1st group: qualified class name
	// 2nd group: optional method name (incl. leading dot!)
	var rModule = /^((?:[a-z0-9]+\.)+_?[A-Z]\w+)(\.[a-z]\w+)?$/,
		sStyle = '\
		.blanket-source {\
			overflow-x: scroll;\
			background-color: #FFFFFF;\
			border: 1px solid #CBCBCB;\
			color: #363636;\
			margin: 25px 20px;\
			width: 80%;\
		}\
		.blanket-source div {\
			white-space: pre;\
			tab-size: 4;\
			font-family: monospace;\
		}\
		.blanket-source > div > span:first-child {\
			background-color: #EAEAEA;\
			color: #949494;\
			display: inline-block;\
			padding: 0 10px;\
			text-align: center;\
			width: 30px;\
		}\
		.blanket-source .hits {\
			background-color: #EAEAEA;\
			color: green;\
			display: inline-block;\
			padding: 0 10px;\
			text-align: right;\
			width: 30px;\
		}\
		.blanket-source span.highlight {\
			color: black;\
			background-color: yellow\
		}\
		.blanket-source .hit {\
			background-color: lightgreen\
		}\
		.blanket-source .miss {\
			background-color: #e6c3c7\
		}\
		.blanket-source .skipped {\
			font-style: italic\
		}\
		.blanket-source .miss span.highlight {\
			background-color: #e6c3c7\
		}\
		.coverageSummary {\
			background-color: #0D3349;\
			border-radius: 0 0 5px 5px;\
			font-family: Calibri, Helvetica, Arial, sans-serif;\
			font-size: 1.5em;\
			font-weight: 400;\
			line-height: 1em;\
			padding: 0.5em 0 0.5em 1em;\
		}\
		.coverageSummary a {\
			color: #C6E746;\
		}\
		.coverageSummary a:hover,\
		.coverageSummary a:focus {\
			color: #FFFFFF;\
		}\
	';

	Controller.extend("sap.ui.test.BlanketReporterUI", {
		filterThreshold : function (bFilter) {
			var oBinding,
				oFilter = null,
				oTable = this.byId("Files"),
				iThreshold = this.getView().getModel().getProperty("/threshold");

			if (bFilter) {
				oFilter = new Filter({
					filters : [
						new Filter("lines/coverage", "LT", iThreshold),
						new Filter("branches/coverage", "LT", iThreshold)
					],
					and : false
				});
			}
			oBinding = oTable.getBinding("rows");
			oBinding.filter(oFilter, FilterType.Application);
		},

		onBeforeRendering : function () {
			this.filterThreshold(this.getView().getModel().getProperty("/filterThreshold"));
		},

		onFilterThreshold : function (oEvent) {
			this.filterThreshold(oEvent.getParameter("selected"));
		},

		onRowSelection : function (/*oEvent*/) { // Note: do not use event because of "Show Hits"
			var oContext,
				sFile,
				oHtml = this.byId("blanket-source"),
				iLinesOfContext,
				oModel = this.getView().getModel(),
				aStatistics,
				oTable = this.byId("Files"),
				iSelectedRow = oTable.getSelectedIndex() - oTable.getFirstVisibleRow();

			if (iSelectedRow >= 0) {
				oContext = oTable.getRows()[iSelectedRow].getBindingContext();
				sFile = oContext.getObject("name");
				iLinesOfContext = oModel.getProperty("/linesOfContext");
				aStatistics = oModel.getObject("/coverageData").files[sFile];

				oHtml.setContent('<div class="blanket-source">'
					+ getCodeView(aStatistics, iLinesOfContext, oModel.getProperty("/showHits"))
					+ "</div>");
				oHtml.setVisible(true);
			} else {
				oHtml.setContent("<div></div>");
			}
		}
	});

	/**
	 * Compute HTML "code view" with line and intra-line highlighting.
	 *
	 * @param {string[]} aSourceLines
	 *   Lines of source code
	 * @param {number[]} aHits
	 *   Array of hit counts per line
	 * @param {object[]} aLocations
	 *   Intra-line locations to highlight (given as Blanket.js <code>SourceLocation</code> objects)
	 * @param {number} [iLinesOfContext=Infinity]
	 *   Lines of context to show, default is unlimited
	 * @param {boolean} [bShowHits=false]
	 *   Whether to show hit counts per line and highlight hit lines (not just missed ones)
	 * @returns {string}
	 *   HTML
	 */
	function codeView(aSourceLines, aHits, aLocations, iLinesOfContext, bShowHits) {
		var iHighlightLevel = 0,
			iLastHighlightedLine = -Infinity,
			aPositions = aLocations.reduce(locate, []).sort(comparator),
			iSkippedLines = 0;

		// comparator for two locations
		function comparator(a, b) {
			return a.line - b.line || a.column - b.column;
		}

		// returns HTML for skipped lines, if any; updates iSkippedLines
		function getSkippedHtml() {
			var sHtml = "";

			if (iSkippedLines > 0) {
				sHtml = "<div class='ellipsis'><span>...</span>";
				if (bShowHits) {
					sHtml += "<span class='hits'>&nbsp;</span>";
				}
				sHtml += "<span class='skipped'>" + iSkippedLines + " lines skipped</span></div>";
				iSkippedLines = 0;
			}
			return sHtml;
		}

		// highlight given source code according to current level; updates iLastHighlightedLine
		function highlight(iLine, sSourceCode) {
			sSourceCode = encodeXML(sSourceCode);
			if (sSourceCode && iHighlightLevel) {
				iLastHighlightedLine = iLine;
				sSourceCode = "<span class='highlight'>" + sSourceCode + "</span>";
			}
			return sSourceCode;
		}

		// highlight given line according to current highlight level and positions;
		// updates iHighlightLevel
		function highlightLine(iLine, sSourceLine) {
			var iColumn = 0,
				sResult = "";

			while (aPositions.length && iLine === aPositions[0].line) {
				sResult += highlight(iLine, sSourceLine.slice(iColumn, aPositions[0].column));
				iColumn = aPositions[0].column;
				iHighlightLevel += aPositions.shift().delta;
			}

			sResult += highlight(iLine, sSourceLine.slice(iColumn));
			return sResult;
		}

		// add start/end position of given location
		function locate(aPositions, oLocation) {
			oLocation.start.delta = +1;
			aPositions.push(oLocation.start);
			oLocation.end.delta = -1;
			aPositions.push(oLocation.end);
			return aPositions;
		}

		if (iLinesOfContext === undefined) {
			iLinesOfContext = Infinity;
		}
		return aSourceLines.reduce(function (sHtml, sSourceLine, iLine) {
			var i,
				iNextHighlightedLine = aPositions.length && aPositions[0].line || Infinity,
				iNextHitsLine;

			function show() {
				sHtml += "<div";
				if (aHits[iLine] === 0) {
					sHtml += " class='miss'";
					iLastHighlightedLine = iLine;
				} else if (bShowHits && aHits[iLine] > 0) {
					sHtml += " class='hit'";
				}
				sHtml += "><span>" + iLine + "</span>";
				if (bShowHits) {
					sHtml += "<span class='hits'>"
						+ (aHits[iLine] >= 0 ? aHits[iLine] + "x" : "&nbsp;")
						+ "</span>";
				}
				sHtml += highlightLine(iLine, sSourceLine)
					+ "</div>";
			}

			if (bShowHits) {
				for (i = iLine; i < aHits.length; i += 1) {
					if (aHits[i] !== undefined) {
						iNextHitsLine = i;
						break;
					}
				}
			} else {
				iNextHitsLine = aHits.indexOf(0, iLine);
			}

			if (iNextHitsLine >= 0 && iNextHitsLine < iNextHighlightedLine) {
				iNextHighlightedLine = iNextHitsLine; // treat hit/missed lines as highlighted
			}
			// show iLinesOfContext before and after highlighting, do not skip a single line
			if (iLine >= iNextHighlightedLine - iLinesOfContext
				|| iLine <= iLastHighlightedLine + iLinesOfContext
				|| iNextHighlightedLine - iLastHighlightedLine === 2 * (iLinesOfContext + 1)) {
				sHtml += getSkippedHtml();
				show();
			} else {
				iSkippedLines += 1;
			}
			return sHtml;
		}, "") + getSkippedHtml();
	}

	/**
	 * Compute HTML "code view" with line and branch coverage highlighting from given Blanket.js
	 * statistics.
	 *
	 * @param {number[]} aStatistics
	 *   <code>window._$blanket['file name']</code> array with line coverage etc.
	 * @param {number} [iLinesOfContext=Infinity]
	 *   Lines of context to show, default is unlimited
	 * @param {boolean} [bShowHits=false]
	 *   Whether to show hit counts per line and highlight hit lines (not just missed ones)
	 * @returns {string}
	 *   HTML
	 */
	function getCodeView(aStatistics, iLinesOfContext, bShowHits) {
		var aLocations = aStatistics.branchTracking
				? aStatistics.branchTracking.reduce(locateUncovered, [])
				: [];

		// locate uncovered branches
		function locateUncovered(aLocations, oRecord) {
			if (!oRecord.falsy) { // alternate not covered
				aLocations.push(oRecord.alternate);
			}
			if (!oRecord.truthy) { // consequent not covered
				aLocations.push(oRecord.consequent);
			}
			return aLocations;
		}

		return codeView(aStatistics.source, aStatistics, aLocations,
			bShowHits ? Infinity : iLinesOfContext, bShowHits);
	}

	/**
	 * Calculates a "covered" percentage.
	 *
	 * @param {number} iMissed The number of misses
	 * @param {number} iTotal The total number of tests
	 * @returns {number} The percentage
	 */
	function percent(iMissed, iTotal) {
		return iTotal ? (iTotal - iMissed) / iTotal * 100 : 100;
	}

	/**
	 * Calculates the line and branch coverage for the summary.
	 *
	 * @param {object} oSummary The summary
	 */
	function coverage(oSummary) {
		oSummary.lines.coverage = percent(oSummary.lines.missed, oSummary.lines.total);
		oSummary.branches.coverage = percent(oSummary.branches.missed, oSummary.branches.total);
	}

	/**
	 * Creates the JSON model from the blanket coverage data.
	 *
	 * @param {object} oCoverageData The coverage data
	 * @param {number} iLinesOfContext
	 *   Lines of context to show
	 * @param {number} iThreshold
	 *   Threshold for KPIs as a percentage
	 * @param {string[]} [aTestedFiles]
	 *   The tested files (derived from the module names) or undefined if all tests were run.
	 *   Note: unsorted, may still contain duplicates or even <code>undefined</code>!
	 * @returns {JSONModel} The JSON model
	 */
	function createModel(oCoverageData, iLinesOfContext, iThreshold, aTestedFiles) {
		var mSummarizedFiles = {}, // maps file name to true for already summarized files
			oTotal = {
				files : [],
				lines : {
					total : 0,
					missed : 0,
					coverage : 100
				},
				branches : {
					total : 0,
					missed : 0,
					coverage : 100
				},
				coverageData : oCoverageData,
				filterThreshold : !!iThreshold,
				branchTracking : false,
				showHits : false
			};

		function summarize(sFile) {
			var aFileData = oCoverageData.files[sFile],
				oFileSummary = {
					name : sFile,
					lines : {
						total : 0,
						missed : 0,
						coverage : 100
					},
					branches : {
						total : 0,
						missed : 0,
						coverage : 100
					}
				},
				i;

			if (sFile in mSummarizedFiles) {
				return;
			}
			mSummarizedFiles[sFile] = true;

			for (i = 0; i < aFileData.length; i++) {
				if (aFileData[i] !== undefined) {
					oFileSummary.lines.total++;
					if (aFileData[i] === 0) {
						oFileSummary.lines.missed++;
					}
				}
			}
			if (aFileData.branchTracking) {
				oTotal.branchTracking = true;
				oFileSummary.branches.total = aFileData.branchTracking.length;
				for (i = 0; i < aFileData.branchTracking.length; i++) {
					if (!aFileData.branchTracking[i].falsy
						|| !aFileData.branchTracking[i].truthy) {
						oFileSummary.branches.missed++;
					}
				}
			}
			coverage(oFileSummary);

			oTotal.files.push(oFileSummary);
			oTotal.lines.total += oFileSummary.lines.total;
			oTotal.lines.missed += oFileSummary.lines.missed;
			oTotal.branches.total += oFileSummary.branches.total;
			oTotal.branches.missed += oFileSummary.branches.missed;
		}

		if (aTestedFiles
				&& aTestedFiles.every(function (sFile) {return sFile in oCoverageData.files;})) {
			oTotal.filterThreshold = false;
		} else {
			aTestedFiles = Object.keys(oCoverageData.files);
		}
		aTestedFiles.sort().forEach(summarize);

		oTotal.linesOfContext = iLinesOfContext;
		oTotal.threshold = iThreshold;
		oTotal.visible = Math.min(Math.max(oTotal.files.length, 3), 10);

		coverage(oTotal);
		return new JSONModel(oTotal);
	}

	/**
	 * Creates the view and places it at the given DIV.
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel The model
	 * @param {object} oDiv Some <div>
	 */
	function createViewAndPlaceAt(oModel, oDiv) {
		XMLView.create({viewName: "sap.ui.test.BlanketReporterUI", models: oModel})
			.then(function (oView) {
				oView.placeAt(oDiv);
			});
	}

	function convertToFile(sModule) {
		var aMatches = rModule.exec(sModule);

		return !aMatches || aMatches[2] === ".integration"
			? undefined // "all"
			: jQuery.sap.getResourceName(aMatches[1]);
	}

	/**
	 * Creates a new <div> at the end of the body and includes our style.
	 *
	 * @returns {object}
	 *   The new <div>
	 */
	function getDiv() {
		var oDiv = document.createElement("div"),
			oStyle = document.createElement("style");

		oDiv.setAttribute("id", "blanket-view");
		oDiv.setAttribute("class", "sapUiBody");
		document.body.appendChild(oDiv);

		oStyle.innerHTML = sStyle;
		document.head.appendChild(oStyle);

		return oDiv;
	}

	return function (iLinesOfContext, iThreshold, fnGetTestedModules, oCoverageData) {
		var oDiv, oModel, aTestedModules;

		/*
		 * Tells whether the given module corresponds 1:1 to a single class.
		 *
		 * @param {string} sModule
		 * @return {boolean}
		 */
		function isSingleClass(sModule) {
			var aMatches = rModule.exec(sModule);

			return aMatches && !aMatches[2];
		}

		// Sometimes, when refreshing, this function is called twice. Ignore the 2nd call.
		if (!document.getElementById("blanket-view")) {
			aTestedModules = fnGetTestedModules();
			oModel = createModel(oCoverageData, iLinesOfContext, iThreshold,
				aTestedModules && aTestedModules.map(convertToFile));
			oDiv = getDiv();

			if (UriParameters.fromQuery(window.location.search).get("testId")
				|| aTestedModules && !aTestedModules.every(isSingleClass)) {
				// do not fail due to coverage
				createViewAndPlaceAt(oModel, oDiv);
				return;
			}

			// make QUnit fail (indirectly) and show UI
			if (oModel.getProperty("/lines/coverage") < iThreshold) {
				createViewAndPlaceAt(oModel, oDiv);
				throw new Error("Line coverage too low! "
					+ oModel.getProperty("/lines/coverage") + " < " + iThreshold);
			}
			if (oModel.getProperty("/branches/coverage") < iThreshold) {
				createViewAndPlaceAt(oModel, oDiv);
				throw new Error("Branch coverage too low! "
					+ oModel.getProperty("/branches/coverage") + " < " + iThreshold);
			}

			oDiv.setAttribute("class", "coverageSummary");
			oDiv.innerHTML = '<a href="" id="coverage">Blanket Code Coverage: OK</a>';
			jQuery("#coverage").one("click", function (oMouseEvent) {
				oMouseEvent.preventDefault();
				jQuery(oDiv).fadeOut(function () {
					createViewAndPlaceAt(oModel, getDiv());
				});
			});
		}
	};
}, /* bExport= */ false);