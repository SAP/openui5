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
			"report/DataCollector": {},
			"util/RuleValidator": {
				module: "./util/RuleValidator.qunit"
			},
			"util/Utils": {
				module: "./util/Utils.qunit"
			},
			"SupportAssistantAPI": {},
			"integration/SupportAssistant.opa": {
				title: "Integration Tests for SA",
				module: "sap/ui/support/integration/SupportAssistant.opa.qunit"
			},
			"integration/ui/BootingJourney": {
				title: "Integration Tests for Support Assistant's Booting",
				module: "sap/ui/support/integration/ui/journeys/BootingJourney"
			},
			"integration/ui/SelectionJourney": {
				title: "Integration Tests for Support Assistant's Selection",
				module: "sap/ui/support/integration/ui/journeys/SelectionJourney"
			},
			"integration/ui/LocalStoragePersistencyJourney": {
				title: "Integration Tests for Support Assistant's Local Storage Persistency",
				module: "sap/ui/support/integration/ui/journeys/LocalStoragePersistencyJourney"
			},
			"integration/ui/FilteringAndSortingJourney": {
				title: "Integration Tests for Support Assistant's Filtering and Sorting",
				module: "sap/ui/support/integration/ui/journeys/FilteringAndSortingJourney"
			},
			"integration/ui/PresetsDialogJourney": {
				title: "Integration Tests for Support Assistant's Presets Dialog",
				module: "sap/ui/support/integration/ui/journeys/PresetsDialogJourney"
			},
			"integration/ui/PresetsExportJourney": {
				title: "Integration Tests for Support Assistant's Presets Export",
				module: "sap/ui/support/integration/ui/journeys/PresetsExportJourney"
			},
			"integration/ui/PresetsImportJourney": {
				title: "Integration Tests for Support Assistant's Presets Import",
				module: "sap/ui/support/integration/ui/journeys/PresetsImportJourney"
			},
			"integration/ui/PresetsPersistenceJourney": {
				title: "Integration Tests for Support Assistant's Presets Persistency",
				module: "sap/ui/support/integration/ui/journeys/PresetsPersistenceJourney"
			},
			"integration/ui/TemporaryRulesJourney": {
				title: "Integration Tests for Support Assistant's Temporary Rules",
				module: "sap/ui/support/integration/ui/journeys/TemporaryRulesJourney"
			}
		}
	};
});