/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.m library to the support infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "sap/ui/support/supportRules/RuleSet",
               "./Form.support"],
	function(jQuery, SupportLib, Ruleset,
			FormSupport) {
	"use strict";

	// shortcuts
	//var Audiences = SupportLib.Audiences, // Control, Internal, Application
	//	Categories = SupportLib.Categories, // Accessibility, Performance, Memory, Modelbindings, ...
	//	Severity = SupportLib.Severity;	// Hint, Warning, Error

	var oLib = {
		name: "sap.ui.layout",
		niceName: "UI5 Layout Library"
	};

	var oRuleset = new Ruleset(oLib);

	// Adds the rules related to sap.m.List, sap.m.Table and sap.m.Tree
	FormSupport.addRulesToRuleset(oRuleset);

	//Add rules with the addRule method
	//oRuleset.addRule({})

	return {lib: oLib, ruleset: oRuleset};

}, true);