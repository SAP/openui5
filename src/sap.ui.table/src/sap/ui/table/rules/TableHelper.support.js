/*!
 * ${copyright}
 */
/**
 * Helper functionality for table, list and tree controls for the Support Tool infrastructure.
 */
sap.ui.define([
	"sap/ui/support/library", "sap/base/Log"
], function(SupportLib, Log) {
	"use strict";

	var Severity = SupportLib.Severity;

	var TableSupportHelper = {
		DOCU_REF: "https://ui5.sap.com/",

		/**
		 * Normalizes the given rule definition.
		 * The rule definition object can/must have the following parameters:
		 *
		 * 		id:				ID of the rule, MANDATORY
		 * 		audiences:		[Audiences.Application, ...] - Choose one or several, Default "Application"
		 * 		categories:		[Categories.Accessibility, ...] - choose one or several, Default "Other" (TBD)
		 * 		enabled:		true/false - Default true
		 * 		minversion:		the minimum version required to run the rule - Default "1.38"
		 * 		maxversion:		the maximum version required to run the rule - Default "-"
		 * 		title:			user friendly title, MANDATORY
		 * 		description:	detailed description, MANDATORY
		 * 		resolution:		proposed resolution steps, MANDATORY
		 * 		resolutionurls: [{text: "Text to be displayed", href: "URL to public(!) docu"}] - list of useful URLs, Default []
		 * 		check:			function(oIssueManager, oCoreFacade, oScope) { ... } - Check function code, MANDATORY
		 *
		 * @param {object} oRuleDef The rule definition
		 * @returns {object} The normalized rule definition
		 */
		normalizeRule: function(oRuleDef) {
			if (oRuleDef.id && oRuleDef.id !== "") {
				oRuleDef.id = "gridTable" + oRuleDef.id;
			}

			return oRuleDef;
		},

		/**
		 * Creates a documentation link description in the format as requested by the parameter resolutionurls of a rule.
		 * @param {string} sText 		The text of the docu link.
		 * @param {string} sRefSuffix 	The url suffix. It gets automatically prefixed by TableSupportHelper.DOCU_REF.
		 * @returns {object} Documentation link description
		 */
		createDocuRef: function(sText, sRefSuffix) {
			return {
				text: sText,
				href: TableSupportHelper.DOCU_REF + sRefSuffix
			};
		},

		/**
		 * Creates a resolution entry for the Fiori Design Guidelines for the GridTable.
		 * @returns {{text: string, href: string}} The resolution entry object.
		 */
		createFioriGuidelineResolutionEntry: function() {
			return {
				text: "SAP Fiori Design Guidelines: Grid Table",
				href: "https://experience.sap.com/fiori-design-web/grid-table"
			};
		},

		/**
		 * Adds an issue with the given text, severity and context to the given issue manager.
		 * @param {sap.ui.support.IssueManager} oIssueManager The issue manager
		 * @param {string} sText 						The text of the issue.
		 * @param {sap.ui.support.Severity} [sSeverity] The severity of the issue, if nothing is given Warning is used.
		 * @param {string} [sControlId] 				The id of the control the issue is related to. If nothing is given the "global" context is
		 *     used.
		 */
		reportIssue: function(oIssueManager, sText, sSeverity, sControlId) {
			oIssueManager.addIssue({
				severity: sSeverity || Severity.Medium,
				details: sText,
				context: {id: sControlId || "WEBPAGE"}
			});
		},

		/**
		 * Return all existing control instances of the given type.
		 * @param {object} oScope The scope as given in the rule check function.
		 * @param {boolean} bVisibleOnly Whether all existing controls or only the ones which currently have a DOM reference should be returned.
		 * @param {string} sType The type
		 * @returns {sap.ui.core.Element[]} All existing control instances
		 */
		find: function(oScope, bVisibleOnly, sType) {
			var mElements = oScope.getElements();
			var aResult = [];
			for (var n in mElements) {
				var oElement = mElements[n];
				if (oElement.isA(sType)) {
					if (bVisibleOnly && oElement.getDomRef() || !bVisibleOnly) {
						aResult.push(oElement);
					}
				}
			}
			return aResult;
		},

		/**
		 * Iterates over the available log entries.
		 *
		 * Both parameter functions gets a log entry object passed in with the following properties:
		 * <ul>
		 *    <li>{jQuery.sap.log.Level} oLogEntry.level One of the log levels FATAL, ERROR, WARNING, INFO, DEBUG, TRACE</li>
		 *    <li>{string} oLogEntry.message     The logged message</li>
		 *    <li>{string} oLogEntry.details     The optional details for the message</li>
		 *    <li>{string} oLogEntry.component   The optional log component under which the message was logged</li>
		 *    <li>{float}  oLogEntry.timestamp   The timestamp when the log entry was written</li>
		 *    <li>{object} oLogEntry.supportInfo The optional support info object</li>
		 * </ul>
		 *
		 * @param {function} fnFilter Filter function to filter out irrelevant log entries.
		 *                            If the function returns <code>true</code> the log entry is kept, otherwise it's filtered out.
		 * @param {string} fnCheck Check function to check the remaining log entries.
		 *                         If the function returns <code>true</code> the checking procedure is stopped,
		 *                         otherwise the next entry is passed for checking.
		 */
		checkLogEntries: function(fnFilter, fnCheck) {
			var aLog = Log.getLogEntries(); //oScope.getLoggedObjects(); /*getLoggedObjects returns only log entries with supportinfo*/
			var oLogEntry;
			for (var i = 0; i < aLog.length; i++) {
				oLogEntry = aLog[i];
				if (fnFilter(oLogEntry)) {
					if (fnCheck(oLogEntry)) {
						return;
					}
				}
			}
		}
	};

	return TableSupportHelper;

}, true);