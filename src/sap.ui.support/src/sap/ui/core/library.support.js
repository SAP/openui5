/*!
 * ${copyright}
 */
/**
 * Adds support rules to the core
 */
sap.ui.define(["jquery.sap.global",
		"./Misc.support",
		"./Config.support",
		"./Model.support",
		"./View.support",
		"./App.support"],
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