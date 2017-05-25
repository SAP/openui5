/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.m library to the support infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library", "sap/ui/support/supportRules/RuleSet",
			   "./Button.support",
			   "./Dialog.support",
			   "./Input.support"],
	function(jQuery, SupportLib, Ruleset,
			 ButtonSupport,
			 DialogSupport,
			 InputSupport) {
	"use strict";

	var oLib = {
		name: "sap.m",
		niceName: "UI5 Main Library"
	};
	var oRuleset = new Ruleset(oLib);

	ButtonSupport.addRulesToRuleset(oRuleset);
	DialogSupport.addRulesToRuleset(oRuleset);
	InputSupport.addRulesToRuleset(oRuleset);

	return {lib: oLib, ruleset: oRuleset};

}, true);
