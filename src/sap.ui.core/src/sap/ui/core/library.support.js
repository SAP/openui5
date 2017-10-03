/*!
 * ${copyright}
 */
/**
 * Adds support rules to the core
 */
sap.ui.define(["jquery.sap.global",
		"./rules/Misc.support",
		"./rules/Config.support",
		"./rules/Model.support",
		"./rules/View.support",
		"./rules/App.support"],
	function(jQuery, MiscSupport, ConfigSupport, ModelSupport, ViewSupport, AppSupport) {
	"use strict";

	return {
		name: "sap.ui.core",
		niceName: "UI5 Core Library",
		ruleset: [
			MiscSupport,
			ConfigSupport,
			ModelSupport,
			ViewSupport,
			AppSupport
		]
	};
}, true);