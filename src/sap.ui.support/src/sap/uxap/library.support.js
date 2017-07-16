/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.uxap library to the support infrastructure.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/support/library",
	"sap/ui/support/supportRules/RuleSet",
	"./ObjectPageLayout.support"],

	function(jQuery,
			 SupportLib,
			 Ruleset,
			 ObjectPageLayoutSupport) {

	"use strict";

	var oLib = {
		name: "sap.uxap",
		niceName: "ObjectPage library"
	};

	var oRuleset = new Ruleset(oLib);
		ObjectPageLayoutSupport.addRulesToRuleset(oRuleset);

	return {lib: oLib, ruleset: oRuleset};

}, true);
