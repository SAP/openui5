/*!
 * ${copyright}
 */
/**
 * Helper functionality for table, list and tree controls for the Support Tool infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library"],
	function(jQuery, SupportLib) {
	"use strict";

	// shortcuts
	var Audiences = SupportLib.Audiences, // Control, Internal, Application
		Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity;	// Hint, Warning, Error


	var TableSupportHelper = {

		DOCU_REF : "https://sapui5.hana.ondemand.com/",

		DEFAULT_RULE_DEF : {
			audiences: [Audiences.Application],
			categories: [Categories.Other],
			enabled: true,
			minversion: "1.38",
			maxversion: "-",
			title: "",
			description: "",
			resolution: "",
			resolutionurls: [],
			check: function(oIssueManager, oCoreFacade, oScope) {}
		},

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
		 * @param {object} The rule definition
		 * @returns The normalized rule definition
		 */
		normalizeRule : function(oRuleDef) {
			return jQuery.extend({}, TableSupportHelper.DEFAULT_RULE_DEF, oRuleDef);
		},

		/**
		 * Normalizes the given rule definition and adds it to the given Ruleset.
		 *
		 * @see #normalizeRule
		 *
		 * @param {object} The rule definition
		 * @param {sap.ui.support.supportRules.RuleSet} The ruleset
		 */
		addRuleToRuleset : function(oRuleDef, oRuleset) {
			oRuleDef = TableSupportHelper.normalizeRule(oRuleDef);
			var sResult = oRuleset.addRule(oRuleDef);
			if (sResult != "success") {
				jQuery.sap.log.warning("Support Rule '" + oRuleDef.id + "' for library sap.ui.table not applied: " + sResult);
			}
		},

		/**
		 * Creates a documentation link description in the format as requested by the parameter resolutionurls of a rule.
		 * @param {string} sText 		The text of the docu link.
		 * @param {string} sRefSuffix 	The url suffix. It gets automatically prefixed by TableSupportHelper.DOCU_REF.
		 * @returns Documentation link description
		 */
		createDocuRef : function(sText, sRefSuffix) {
			return {
				text: sText,
				href: TableSupportHelper.DOCU_REF + sRefSuffix
			};
		},

		/**
		 * Adds an issue with the given text, severity and context to the given issue manager.
		 * @param {sap.ui.support.IssueManager} oIssueManager The issue manager
		 * @param {string} sText 						The text of the issue.
		 * @param {sap.ui.support.Severity} [sSeverity] The severity of the issue, if nothing is given Warning is used.
		 * @param {string} [sControlId] 				The id of the control the issue is related to. If nothing is given the "global" context is used.
		 */
		reportIssue : function(oIssueManager, sText, sSeverity, sControlId) {
			oIssueManager.addIssue({
				severity: sSeverity || Severity.Medium,
				details: sText,
				context: {id: sControlId || "WEBPAGE"}
			});
		},

		/**
		 * Checks whether the given object is of the given type (given in AMD module syntax)
		 * without the need of loading the types module.
		 * @param {sap.ui.base.ManagedObject} oObject The object to check
		 * @param {string} sType The type given in AMD module syntax
		 * @returns {boolean}
		 */
		isInstanceOf : function(oObject, sType) {
			if (!oObject || !sType) {
				return false;
			}
			var oType = sap.ui.require(sType);
			return !!(oType && (oObject instanceof oType));
		},

		/**
		 * Return all existing control instances of the given type.
		 * @param {object} oScope The scope as given in the rule check function.
		 * @param {boolean} bVisisbleOnly Whether all existing controls or only the ones which currently have a DOM reference should be returned.
		 * @param {string} sType The type given in AMD module syntax
		 * @returns All existing control instances
		 */
		find: function(oScope, bVisisbleOnly, sType) {
			var mElements = oScope.getElements();
			var aResult = [];
			for (var n in mElements) {
				var oElement = mElements[n];
				if (TableSupportHelper.isInstanceOf(oElement, sType)) {
					if (bVisisbleOnly && oElement.getDomRef() || !bVisisbleOnly) {
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
		checkLogEntries : function(fnFilter, fnCheck) {
			var aLog = jQuery.sap.log.getLogEntries(); //oScope.getLoggedObjects(); /*getLoggedObjects returns only log entries with supportinfo*/
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