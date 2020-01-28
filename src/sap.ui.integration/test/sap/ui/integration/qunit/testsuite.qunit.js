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
				language: "en",
				libs: ["sap.f", "sap.m", "sap.ui.integration"], // Libraries to load upfront in addition to the library which is tested, if null no libs are loaded
				noConflict: true,
				// preload: "auto",
				"xx-waitForTheme": "init"
			},
			coverage: {
				only: ["sap/ui/integration"]
			},
			autostart: true,
			page: "test-resources/sap/ui/integration/qunit/testsandbox.qunit.html?test={name}"
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
					'./CardDataHandling.qunit',
					'./CardDesigntime.qunit',
					'./CardFormatters.qunit'
				]
			},
			"CalendarCard": {},
			"cardbundle/CardStaticResources": {},
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
			"customElements/CustomElements": {
				ui5: {
					libs: ["sap.ui.integration"]
				},
				coverage: {
					only: [
						"sap/ui/integration/customElements/"
					]
				}
			},
			"AllCards": {
				ui5: {
					libs: ["sap.ui.integration"]
				},
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card",
						"sap/ui/integration/util/CardManifest",
						"sap/ui/integration/util/ServiceManager",
						"sap/ui/integration/customElements/",
						"sap/f/cards/CalendarCard",
						"sap/f/cards/CardActions",
						"sap/f/cards/AnalyticalContent",
						"sap/f/cards/BindingHelper",
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
						"sap/f/cards/TableContent",
						"sap/f/cards/IconFormatter"
					]
				},
				module: [
					'./Card.qunit',
					'./CardDataHandling.qunit',
					'./util/CardManifest.qunit',
					'./util/ServiceManager.qunit',
					'./customElements/CustomElements.qunit',
					'test-resources/sap/f/qunit/BindingHelper.qunit',
					'test-resources/sap/f/qunit/BindingResolver.qunit',
					'test-resources/sap/f/qunit/DataProvider.qunit',
					'./CardActions.qunit',
					'./cardbundle/CardStaticResources.qunit',
					'./CardFormatters.qunit'
				]
			},
			"designtime/baseEditor/BaseEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/BaseEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/PropertyEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/PropertyEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/PropertyEditors": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/PropertyEditors"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/stringEditor/StringEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/numberEditor/NumberEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/mapEditor/MapEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/iconEditor/IconEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/parametersEditor/ParametersEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/parametersEditor/ParametersEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/PropertyEditorFactory": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/ObjectBinding": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/ObjectBinding"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/createPromise": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/createPromise"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/escapeParameter": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/escapeParameter"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/findClosestInstance": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/findClosestInstance"
					]
				},
				sinon: false
			}
		}
	};
});
