/*!
 * ${copyright}
 */
/**
 * Adds support rules to the core
 */
sap.ui.define(["jquery.sap.global",
		"sap/ui/support/supportRules/RuleSet",
		"./Misc.support",
		"./Config.support",
		"./Model.support",
		"./View.support",
		"./App.support"],
	function(jQuery, RuleSet, MiscSupport, ConfigSupport, ModelSupport, ViewSupport, AppSupport) {
	"use strict";

	var oLib = {
		name: "sap.ui.core",
		niceName: "UI5 Core Library"
	};

	var oRuleSet = new RuleSet(oLib);


	// Adds the miscellaneous rules
	MiscSupport.addRulesToRuleSet(oRuleSet);

	// Adds the configuration rules
	ConfigSupport.addRulesToRuleSet(oRuleSet);

	// Adds the model rules
	ModelSupport.addRulesToRuleSet(oRuleSet);

	// Adds the view related rules
	ViewSupport.addRulesToRuleSet(oRuleSet, {
		iNumberOfControlsThreshold: 20000
	});

	// Adds the app related rules
	var aObsoleteFunctionNames = ["jQuery.sap.require", "$.sap.require", "sap.ui.requireSync", "jQuery.sap.sjax"];
	if (jQuery && jQuery.sap && jQuery.sap.sjax) {
		aObsoleteFunctionNames.push("jQuery.sap.syncHead",
			"jQuery.sap.syncGet",
			"jQuery.sap.syncPost",
			"jQuery.sap.syncGetText",
			"jQuery.sap.syncGetJSON");
	}

	AppSupport.addRulesToRuleSet(oRuleSet, {
		aObsoleteFunctionNames: aObsoleteFunctionNames
	});



	return {
		lib: oLib,
		ruleset: oRuleSet
	};
}, true);