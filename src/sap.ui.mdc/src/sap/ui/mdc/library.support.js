/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.ui.table library to the support infrastructure.
 */
sap.ui.define([
	"./rules/Table.support"
], function(MDCTableRules) {
	"use strict";

	return {
		name: "sap.ui.mdc",
		niceName: "UI5 MDC Library",
		ruleset: [
			MDCTableRules
		]
	};

});