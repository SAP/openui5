/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/thirdparty/jquery",
		'sap/ui/base/Object',
		"sap/base/util/UriParameters",
		"sap/base/Log",
		"sap/ui/support/RuleAnalyzer",
		"sap/ui/support/library"
	],
	function(jQuery,
			 BaseObject,
			 UriParameters,
			 Log,
			 RuleAnalyzer,
			 library) {
	"use strict";

	/**
	 * @class
	 * This class represents an extension for OPA tests which allows running Support Assistant checks.
	 *
	 * It enriches the OPA assertions with the methods described in {@link sap.ui.core.support.RuleEngineOpaAssertions}.
	 *
	 * For more information, see {@link topic:cfabbd4dfc054936997d9d00916e1668 Integrating the Support Assistant in OPA Tests}.
	 *
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.core.support.RuleEngineOpaExtension
	 * @since 1.48
	 * @public
	 */
	var Extension = BaseObject.extend("sap.ui.core.support.RuleEngineOpaExtension", /** @lends sap.ui.core.support.RuleEngineOpaExtension.prototype */ {
		metadata : {
			publicMethods : [
				"getAssertions"
			]
		},

		/**
		 * When the application under test is started in a UIComponent container instead of an iframe
		 * the Support Assistant is not loaded because the application doesn't start a separate instance of the Core
		 * to start in Support Mode. In such cases manually start the Support Assistant in the current instance of the Core.
		 *
		 * @returns {jQuery.promise} A promise that gets resolved when the Support Assistant is ready.
		 */
		onAfterInit : function () {
			var bLoaded = sap.ui.getCore().getLoadedLibraries()["sap.ui.support"],
				deferred = jQuery.Deferred();

			if (!bLoaded) {
				sap.ui.require(["sap/ui/support/Bootstrap"], function (bootstrap) {
					bootstrap.initSupportRules(["true", "silent"], {
						onReady: function () {
							deferred.resolve();
						}
					});
				}, function (oError) {
					Log.error("Could not load module 'sap/ui/support/Bootstrap':", oError);
				});
			} else {
				deferred.resolve();
			}

			return deferred.promise();
		},

		/**
		 * @public
		 * @returns {sap.ui.core.support.RuleEngineOpaAssertions} Object with the methods which will enhance the OPA assertions.
		 */
		getAssertions : function () {

			var fnShouldSkipRulesIssues = function () {
				return UriParameters.fromQuery(window.location.search).get('sap-skip-rules-issues') == 'true';
			};
			var getWindow = function () {
				var opaWindow = window.parent;
				opaWindow._$files = opaWindow._$files || [];
				return opaWindow;
			};

			/**
			 * RuleEngineOpaAssertions represents a set of methods with which OPA test assertions can be enhanced.
			 * To use this functionality, {@link sap.ui.core.support.RuleEngineOpaExtension RuleEngineOpaExtension} should be provided in the OPA extensions list.
			 *
			 * @namespace
			 * @name sap.ui.core.support.RuleEngineOpaAssertions
			 * @public
			 */
			var oRuleEngineAssertions = /** @lends sap.ui.core.support.RuleEngineOpaAssertions */ {
				/**
				 * Run the Support Assistant and analyze against a specific state of the application.
				 * Depending on the options passed the assertion might either fail or not if any issues were found.
				 *
				 * If "sap-skip-rules-issues=true" is set as an URI parameter, assertion result will be always positive.
				 *
				 * @param {Object} [options] The options used to configure an analysis.
				 * @param {boolean} [options.failOnAnyIssues=true] Should the test fail or not if there are issues of any severity.
				 * @param {boolean} [options.failOnHighIssues] Should the test fail or not if there are issues of high severity.
				 * This parameter will override failOnAnyIssues if set.
				 * @param {Array.<{libName:string, ruleId:string}>} [options.rules] The rules to check.
				 * @param {Object} [options.executionScope] The execution scope of the analysis.
				 * @param {Object} [options.metadata] The metadata that will be passed to the analyse method.
				 * @param {string} [options.executionScope.type=global] The type of the execution scope, one of 'global', 'subtree' or 'components'.
				 * @param {string|string[]} [options.executionScope.selectors] The IDs of the components or the subtree.
				 * @public
				 * @returns {Promise} Promise.
				 */
				noRuleFailures: function(options) {
					var ruleDeferred = jQuery.Deferred(),
						options = options[0] || {},
						failOnAnyRuleIssues = options["failOnAnyIssues"],
						failOnHighRuleIssues = options["failOnHighIssues"],
						rules = options.rules,
						preset = options.preset,
						metadata = options.metadata,
						executionScope = options.executionScope;

					// private API provided by jquery.sap.global
					RuleAnalyzer.analyze(executionScope, rules || preset, metadata).then(function () {
						var analysisHistory = RuleAnalyzer.getAnalysisHistory(),
							lastAnalysis = { issues: [] };

						if (analysisHistory.length) {
							lastAnalysis = analysisHistory[analysisHistory.length - 1];
						}

						var issueSummary = lastAnalysis.issues.reduce(function (summary, issue) {
							summary[issue.severity.toLowerCase()] += 1;
							return summary;
						}, { high: 0, medium: 0, low: 0 });

						var assertionResult = lastAnalysis.issues.length === 0;
						if (failOnHighRuleIssues) {
							assertionResult = issueSummary.high === 0;
						} else if (failOnAnyRuleIssues === false || failOnHighRuleIssues === false) {
							assertionResult = true;
						}

						if (fnShouldSkipRulesIssues()) {
							assertionResult = true;
						}

						ruleDeferred.resolve({
							result: assertionResult,
							message: "Support Assistant issues found: [High: " + issueSummary.high +
									 ", Medium: " + issueSummary.medium	+
									 ", Low: " + issueSummary.low +
									 "]",
							expected: "0 high 0 medium 0 low",
							actual: issueSummary.high + " high " + issueSummary.medium + " medium " + issueSummary.low + " low"
						});
					});

					return ruleDeferred.promise();
				},

				/**
				 * If there are issues found the assertion result will be false and a report with all the issues will be generated
				 * in the message of the test. If no issues were found the assertion result will be true and no report will
				 * be generated.
				 *
				 * If "sap-skip-rules-issues=true" is set as an URI parameter, assertion result will be always positive.
				 *
				 * @public
				 * @returns {Promise} Promise.
				 */
				getFinalReport: function () {
					var ruleDeferred = jQuery.Deferred(),
						history = RuleAnalyzer.getFormattedAnalysisHistory(),
						analysisHistory = RuleAnalyzer.getAnalysisHistory(),
						totalIssues = analysisHistory.reduce(function (total, analysis) {
							return total + analysis.issues.length;
						}, 0),
						result = totalIssues === 0,
						message = "Support Assistant Analysis History",
						actual = message;

					if (result) {
						message += " - no issues found";
					} else  if (fnShouldSkipRulesIssues()) {
						result = true;
						message += ' - issues are found. To see them remove the "sap-skip-rules-issues=true" URI parameter';
					}

					ruleDeferred.resolve({
						result: result,
						message: message,
						actual: actual,
						expected: history
					});

					return ruleDeferred.promise();
				},

				/**
				 * Stores analysis history (if such) as last element in window._$files array.
				 * Accessing this array gives an opportunity to store this history in a file.
				 *
				 * @param {Object} [options] The options used to configure reporting.
				 * @param {sap.ui.support.HistoryFormats} [options.historyFormat] The format into which the history object will be converted.
				 * @param {string} [options.fileName] The name of the file. It should have extension .support-assistant.json". Example: myfile.support-assistant.json
				 *                                    <b>Note:</b> Extension ".support-assistant.json" will be appended automatically, if it is not already given.
				 *                                    If only ".json" extension is given, it will be turned to ".support-assistant.json"
				 *
				 * @public
				 * @returns {Promise} Promise.
				 */
				getReportAsFileInFormat: function (options) {
					var oContext,
						oHistory,
						oOptions = options[0] || {},
						ruleDeferred = jQuery.Deferred(),
						sHistoryFormat = oOptions["historyFormat"],
						sFileName = oOptions["fileName"];

					switch (sHistoryFormat) {
						case library.HistoryFormats.Abap:
							if (!sFileName) {
								sFileName = "abap-report.support-assistant.json";
							}
							oHistory = RuleAnalyzer.getFormattedAnalysisHistory(sHistoryFormat);
							break;
						case library.HistoryFormats.String:
							if (!sFileName) {
								sFileName = "string-report.support-assistant.json";
							}
							oHistory = RuleAnalyzer.getFormattedAnalysisHistory(sHistoryFormat);
							break;
						default :
							if (!sFileName) {
								sFileName = "report.support-assistant.json";
							}
							oHistory = RuleAnalyzer.getAnalysisHistory();
					}

					sFileName = Extension._formatFileName(sFileName);

					oContext = getWindow();

					// Avoid method calls on _$files as IE11/Edge throws "Can't execute code from a freed script"
					// BCP: 1980144925
					oContext._$files[oContext._$files.length] = {
						name: sFileName,
						content: JSON.stringify(oHistory)
					};

					ruleDeferred.resolve({
						result: true,
						message: "Support Assistant Analysis History was stored in window._$files with following name " + sFileName,
						actual: true,
						expected: true
					});

					return ruleDeferred.promise();
				}
			};

			return oRuleEngineAssertions;
		}
	});

	/**
	 * Appends ".support-assistant.json" to a file name, if not already given.
	 *
	 * @private
	 * @param {string} sFileName Unformatted file name.
	 * @returns {string} Formatted file name.
	 */
	Extension._formatFileName = function (sFileName) {

		var sFormattedFileName = "";

		if ((/\.support-assistant.json$/i).test(sFileName)) { // if the file extension is already .support-assistant.json do nothing
			sFormattedFileName = sFileName;
		} else if ((/\.json$/i).test(sFileName)) { // if the file has .json extension, replace it with .support-assistant.json"
			sFormattedFileName = sFileName.replace(/\.json$/i, ".support-assistant.json");
		} else { // give standardized one
			sFormattedFileName = sFileName + ".support-assistant.json";
		}

		if (sFileName !== sFormattedFileName) {
			Log.warning("Attempt to save report in file with name " + sFileName + ". Name changed to " + sFormattedFileName + ".");
		}

		return sFormattedFileName;
	};

	return Extension;
});