/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.ui.table library to the support infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "sap/ui/support/supportRules/RuleSet", "./TableHelper.support"],
	function(jQuery, SupportLib, Ruleset, SupportHelper) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity;	// Hint, Warning, Error
		//Audiences = SupportLib.Audiences; // Control, Internal, Application

	var oLib = {
		name: "sap.ui.table",
		niceName: "UI5 Table library"
	};

	var oRuleset = new Ruleset(oLib);

	function createRule(oRuleDef) {
		oRuleDef.id = "GRIDTABLE_" + oRuleDef.id;
		SupportHelper.addRuleToRuleset(oRuleDef, oRuleset);
	}


	//**********************************************************
	// Rule Definitions
	//**********************************************************


	/*
	 * Checks whether content densities are used correctly.
	 */
	createRule({
		id : "CONTENT_DENSITY",
		title : "Content Density Usage",
		description : "Checks whether the content densities 'Cozy', 'Compact' and 'Condensed' are used correctly.",
		resolution : "Ensure that either only the 'Cozy' or 'Compact' content density is used or the 'Condensed' and 'Compact' content densities in combination are used.",
		resolutionurls : [SupportHelper.createDocuRef("How to use Content Densities", "#docs/guide/e54f729da8e3405fae5e4fe8ae7784c1.html")],
		check : function(oIssueManager, oCoreFacade, oScope) {
			var $Document = jQuery("html");
			var $Cozy = $Document.find(".sapUiSizeCozy");
			var $Compact = $Document.find(".sapUiSizeCompact");
			var $Condensed = $Document.find(".sapUiSizeCondensed");

			function checkDensity($Source, sTargetClass, sMessage) {
				var bFound = false;
				$Source.each(function(){
					if (jQuery(this).closest(sTargetClass).length) {
						bFound = true;
					}
				});
				if (bFound && sMessage) {
					SupportHelper.reportIssue(oIssueManager, sMessage, Severity.High);
				}
				return bFound;
			}

			checkDensity($Compact, ".sapUiSizeCozy", "'Compact' content density is used within 'Cozy' area.");
			checkDensity($Cozy, ".sapUiSizeCompact", "'Cozy' content density is used within 'Compact' area.");
			checkDensity($Condensed, ".sapUiSizeCozy", "'Condensed' content density is used within 'Cozy' area.");
			checkDensity($Cozy, ".sapUiSizeCondensed", "'Cozy' content density is used within 'Condensed' area.");

			if ($Condensed.length > 0) {
				var bFound = checkDensity($Condensed, ".sapUiSizeCompact");
				if (!bFound) {
					SupportHelper.reportIssue(oIssueManager, "'Condensed' content density must be used in combination with 'Compact'.", Severity.High);
				}
			}
		}
	});

	/*
	 * Validates whether title or aria-labelledby is correctly set
	 */
	createRule({
		id : "VALIDATE_ACC_TITLE",
		categories: [Categories.Accessibility],
		title : "Accessible Label",
		description : "Checks whether 'sap.ui.table.Table' controls have an accessible label.",
		resolution : "Use the 'title' aggregation or the 'ariaLabelledBy' association of the 'sap.ui.table.Table' control to define a proper accessible labeling.",
		check : function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap/ui/table/Table");
			for (var i = 0; i < aTables.length; i++) {
				if (!aTables[i].getTitle() && aTables[i].getAriaLabelledBy().length == 0) {
					SupportHelper.reportIssue(oIssueManager, "Table '" + aTables[i].getId() + "' does not have an accessible label.", Severity.High, aTables[i].getId());
				}
			}
		}
	});

	return {lib: oLib, ruleset: oRuleset};

}, true);
