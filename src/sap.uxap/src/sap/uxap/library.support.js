/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.uxap library to the support infrastructure.
 */
sap.ui.define([	"./rules/ObjectPageLayout.support"],
	function(ObjectPageLayoutSupport) {
	"use strict";

	return {
		name: "sap.uxap",
		niceName: "ObjectPage library",
		ruleset: [
			ObjectPageLayoutSupport
		]
	};

}, true);
