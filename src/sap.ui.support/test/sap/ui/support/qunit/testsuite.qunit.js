sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.support'",
		defaults: {
			group: "Library",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "en-US",
				rtl: false,
				async: false,
				libs: ["sap.ui.support"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: "[sap/ui/support]",
				branchCoverage: true
			},
			loader: {
				paths: {
					"sap/ui/support/mock": "test-resources/sap/ui/support/mock/",
					"sap/ui/support/integration": "test-resources/sap/ui/support/integration/"
				}
			},
			page: "test-resources/sap/ui/support/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"Rules-RuleValidation": {
				module: "./rules/RuleValidation.qunit",
				autostart: false
			},
			"RuleSerializer": {},
			"RuleSet": {},
			"RuleSetLoader": {},
			"IssueManager": {},
			"History": {},
			"ExecutionScope": {},
			"CoreFacade": {},
			"Main": {
				sinon: {
					useFakeTimers: true
				}
			},
			"Storage": {},
			"Archiver": {},
			"ElementTree": {},
			"WindowCommunicationBus": {},
			"Analyzer": {
				sinon: {
					useFakeTimers: true
				}
			},
			"util/RuleValidator": {
				module: "./util/RuleValidator.qunit"
			},
			"util/Utils": {
				module: "./util/Utils.qunit"
			},
			"SupportAssistantAPI": {},
			"SupportAssistant.opa": {
				title: "Integration Tests for SA",
				module: [
					"sap/ui/support/integration/SupportAssistant.opa.qunit"
				]
			},
			"SupportAssistant/ui/opaTests": {
				title: "Integration Tests for Support Assistant's UI",
				module: [
					"sap/ui/support/integration/ui/AllJourneys"
				],
				autostart: false
			}
		}
	};
});