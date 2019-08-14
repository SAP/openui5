sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit TestSuite for sap.ui.integration",
		defaults: {
			qunit: {
				version: "edge"
			},
			sinon: {
				version: "edge"
			},
			ui5: {
				libs: ["sap.f", "sap.m"], // Libraries to load upfront in addition to the library which is tested, if null no libs are loaded
				noConflict: true,
				preload: "auto"
			},
			coverage: {
				only: ["sap/ui/integration"]
			},
			autostart: true
		},
		tests: {
			"Card": {
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card"
					]
				},
				module: [
					'./Card.qunit',
					'./CardDataHandling.qunit'
				]
			},
			"util/CardManifest": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardManifest"
					]
				}
			},
			"util/ServiceManager": {
				coverage: {
					only: [
						"sap/ui/integration/util/ServiceManager"
					]
				}
			},
			"util/CustomElements": {
				coverage: {
					only: [
						"sap/ui/integration/util/CustomElements"
					]
				}
			},
			"designtime": {
				coverage: {
					only: [
						"sap/ui/integration/designtime/controls/BaseEditor"
					]
				},
				module: [
					'./designtime/controls/BaseEditor.qunit'
				]
			},
			"AllCards": {
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card",
						"sap/ui/integration/util/CardManifest",
						"sap/ui/integration/util/ServiceManager",
						"sap/ui/integration/util/CustomElements",
						"sap/f/cards/ActionEnablement",
						"sap/f/cards/AnalyticalContent",
						"sap/f/cards/BindingResolver",
						"sap/f/cards/ComponentContent",
						"sap/f/cards/DataProvider",
						"sap/f/cards/DataProviderFactory",
						"sap/f/cards/Header",
						"sap/f/cards/HeaderRenderer",
						"sap/f/cards/ListContent",
						"sap/f/cards/NumericHeader",
						"sap/f/cards/NumericHeaderRenderer",
						"sap/f/cards/NumericSideIndicator",
						"sap/f/cards/NumericSideIndicatorRenderer",
						"sap/f/cards/ObjectContent",
						"sap/f/cards/RequestDataProvider",
						"sap/f/cards/ServiceDataProvider",
						"sap/f/cards/TableContent"
					]
				},
				module: [
					'./Card.qunit',
					'./CardDataHandling.qunit',
					'./util/CardManifest.qunit',
					'./util/ServiceManager.qunit',
					'./util/CustomElements.qunit',
					'test-resources/sap/f/qunit/BindingResolver.qunit',
					'test-resources/sap/f/qunit/DataProvider.qunit',
					'./ActionEnablement.qunit'
				]
			}
		}
	};
});