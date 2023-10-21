sap.ui.define(function() {
	"use strict";
	return {
		name: "Opa sap.ui.rta",
		defaults: {
			group: "Opa",
			qunit: {
				version: 2
			},
			sinon: false,
			ui5: {
				language: "en",
				libs: ["sap.ui.core", "sap.m", "sap.ui.fl", "sap.ui.dt", "sap.ui.rta", "sap.ui.layout"],
				"xx-waitForTheme": "init"
			},
			coverage: {
				only: ["sap/ui/rta"],
				branchCoverage: true
			},
			loader: {},
			page: "test-resources/sap/ui/rta/qunit/testsandbox.qunit.html?testsuite={suite}&test={name}",
			autostart: true,
			module: "./../{name}.qunit"
		},
		tests: {
			"opa/contextBased/integration/ManageAdaptationsDialogJourney": {
				title: "Manage Context-Based Adaptation"
			},
			"opa/contextBased/integration/SaveAsAdaptationDialogJourney": {
				title: "SaveAs Context-Based Adaptation"
			},
			"opa/contextBased/integration/SearchContextBasedAdaptationDialogJourney": {
				title: "Search Bar Context-Based Adaptation"
			},
			"opa/variantManagement/integration/VariantManagementJourney": {
				title: "Variant Management Opa Tests"
			}
		}
	};
});