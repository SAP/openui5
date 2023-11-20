/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.ui.table library to the support infrastructure.
 */
sap.ui.define([
	"./rules/Accessibility.support",
	"./rules/Binding.support",
	"./rules/ColumnTemplate.support",
	"./rules/Plugins.support",
	"./rules/Rows.support"
], function(AccessibilityRules, BindingRules, ColumnTemplateRules, PluginRules, RowRules) {
	"use strict";

	return {
		name: "sap.ui.table",
		niceName: "UI5 Table Library",
		ruleset: [
			AccessibilityRules,
			BindingRules,
			ColumnTemplateRules,
			PluginRules,
			RowRules
		]
	};

}, true);