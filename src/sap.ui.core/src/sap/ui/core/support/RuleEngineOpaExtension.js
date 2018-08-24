/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global",
		'sap/ui/base/Object',
		"sap/base/util/UriParameters",
		"sap/ui/thirdparty/jquery",
		"sap/ui/support/RuleAnalyzer",
		"sap/ui/support/library"],
	function(jQuery,
			 BaseObject,
			 UriParameters,
			 jQueryDOM,
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
				deferred = jQueryDOM.Deferred();

			if (!bLoaded) {
				sap.ui.require(["sap/ui/support/Bootstrap"], function (bootstrap) {
					bootstrap.initSupportRules(["true", "silent"], {
						onReady: function () {
							deferred.resolve();
						}
					});
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
			 * @class
			 * RuleEngineOpaAssertions represents a set of methods with which OPA test assertions can be enhanced.
			 * To use this functionality, {@link sap.ui.core.support.RuleEngineOpaExtension RuleEngineOpaExtension} should be provided in the OPA extensions list.
			 *
			 * @hideconstructor
			 * @alias sap.ui.core.support.RuleEngineOpaAssertions
			 * @public
			 */
			var oRuleEngineAssertions = {
				/**
				 * Run the Support Assistant and analyze against a specific state of the application.
				 * Depending on the options passed the assertion might either fail or not if any issues were found.
				 *
				 * If "sap-skip-rules-issues=true" is set as an URI parameter, assertion result will be always positive.
				 *
				 * @function
				 * @name sap.ui.core.support.RuleEngineOpaAssertions#noRuleFailures
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
					var ruleDeferred = jQueryDOM.Deferred(),
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
				 * @function
				 * @name sap.ui.core.support.RuleEngineOpaAssertions#getFinalReport
				 * @public
				 * @returns {Promise} Promise.
				 */
				getFinalReport: function () {
					var ruleDeferred = jQueryDOM.Deferred(),
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
				 * This stores the passed history format in window._$files array.
				 * Accessing this array give an opportunity to store this history in file
				 *
				 * @function
				 * @name sap.ui.core.support.RuleEngineOpaAssertions#getReportAsFileInFormat
				 * @param {Object} [options] The options used for configuration
				 * @param {sap.ui.support.HistoryFormats} [options.historyFormat] The format into which the history object will be converted.
				 * @param {String} [options.fileName] The name of the file. The file name must be in following format:
				 *
				 *     "name of the file" + . + "file extension"
				 *
				 *      Example: file.json
				 *
				 * @public
				 * @returns {Promise} Promise.
				 */
				getReportAsFileInFormat: function (options) {
					var oContext,
						oHistory,
						options = options[0] || {},
						ruleDeferred = jQueryDOM.Deferred(),
						sHistoryFormat = options["historyFormat"],
						sFile = options["fileName"];

					switch (sHistoryFormat) {
						case library.HistoryFormats.Abap:
							if (!sFile) {
								sFile = "abap-report.json";
							}
							oHistory = RuleAnalyzer.getFormattedAnalysisHistory(sHistoryFormat);
							break;
						case library.HistoryFormats.String:
							if (!sFile) {
								sFile = "string-report.json";
							}
							oHistory = RuleAnalyzer.getFormattedAnalysisHistory(sHistoryFormat);
							break;
						default :
							if (!sFile) {
								sFile = "report.json";
							}
							oHistory = RuleAnalyzer.getAnalysisHistory();
					}

					oContext = getWindow();

					// Avoid method calls on _$files as IE11/Edge throws "Can't execute code from a freed script"
					// BCP: 1980144925
					oContext._$files[oContext._$files.length] = {
						name: sFile,
						content: JSON.stringify(oHistory)
					};

					ruleDeferred.resolve({
						result: true,
						message: "Support Assistant Analysis History was stored in window._$files with following name " + sFile,
						actual: true,
						expected: true
					});

					return ruleDeferred.promise();
				}
			};

			return oRuleEngineAssertions;
		}
	});

	return Extension;
});