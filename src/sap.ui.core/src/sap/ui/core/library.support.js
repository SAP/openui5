/*!
 * ${copyright}
 */
/**
 * Adds support rules to the core
 */
sap.ui.define([
	"./rules/Misc.support",
	"./rules/Config.support",
	"./rules/Model.support",
	"./rules/View.support",
	"./rules/App.support",
	"./rules/Rendering.support"
],
	function(MiscSupport, ConfigSupport, ModelSupport, ViewSupport, AppSupport, RenderingSupport) {
	"use strict";

	return {
		name: "sap.ui.core",
		niceName: "UI5 Core Library",
		ruleset: [
			MiscSupport,
			ConfigSupport,
			ModelSupport,
			ViewSupport,
			AppSupport,
			RenderingSupport
		]
	};
}, true);