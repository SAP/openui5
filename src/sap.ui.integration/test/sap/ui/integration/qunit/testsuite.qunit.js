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
			"AdaptiveCard": {},
			"UI5InputText": {
				coverage: {
					only: ["sap/f/cards/adaptivecards/elements/UI5InputText"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputText.qunit'
				]
			},
			"UI5InputNumber": {
				coverage: {
					only: ["sap/f/cards/adaptivecards/elements/UI5InputNumber"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputNumber.qunit'
				]
			},
			"UI5InputToggle": {
				coverage: {
					only: ["sap/f/cards/adaptivecards/elements/UI5InputToggle"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputToggle.qunit'
				]
			},
			"UI5InputDate": {
				coverage: {
					only: ["sap/f/cards/adaptivecards/elements/UI5InputDate"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputDate.qunit'
				]
			},
			"UI5InputChoiceSet": {
				coverage: {
					only: ["sap/f/cards/adaptivecards/elements/UI5InputChoiceSet"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputChoiceSet.qunit'
				]
			},
			"ActionRender": {
				coverage: {
					only: ["sap/f/cards/adaptivecards/overwrites/ActionRender"]
				},
				module: [
					'./cards/AdaptiveContent/ActionRender.qunit'
				]
			},
			"AdaptiveContentIntegration": {
				title: "Opa test Page for sap.f.AdaptiveContent",
				module: [
					'./cards/AdaptiveContent/AdaptiveContentIntegration.opa.qunit'
				]
			},
			"cardbundle/CardStaticResources": {},
			"util/CardManifest": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardManifest"
					]
				}
			},
			"util/CardMerger": {
				coverage: {
					only: [
						"sap/ui/integration/util/CardMerger"
					]
				},
				sinon: false
			},
			"util/ServiceManager": {
				coverage: {
					only: [
						"sap/ui/integration/util/ServiceManager"
					]
				}
			},
			"CardLoading": {
				ui5: {
					libs: ["sap.ui.integration"]
				},
				coverage: {
					only: [
						"sap/f/cards/Header",
						"sap/f/cards/HeaderRenderer",
						"sap/f/cards/NumericHeader",
						"sap/f/cards/NumericHeaderRenderer",
						"sap/f/cards/NumericSideIndicator",
						"sap/f/cards/NumericSideIndicatorRenderer",
						"sap/f/cards/BaseContent",
						"sap/f/cards/loading/LoadingProvider"
					]
				},
				module: [
					'./loading/CardLoading.qunit'
				]
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
						"sap/ui/integration/util/CardActions",
						"sap/ui/integration/util/CardManifest",
						"sap/ui/integration/util/ServiceManager",
						"sap/ui/integration/customElements/",
						"sap/f/cards/CalendarCard",
						"sap/f/cards/AdaptiveCard",
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
						"sap/f/cards/IconFormatter",
						"sap/ui/integration/BaseContent"
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
					'./CardFormatters.qunit',
					'./BaseContent.qunit'
				]
			},
			"designtime/baseEditor/integration/ReadyHandling": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/BaseEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/BaseEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/BasePropertyEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/BasePropertyEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/PropertyEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/PropertyEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/PropertyEditors": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/PropertyEditors"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/stringEditor/StringEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/booleanEditor/BooleanEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/numberEditor/NumberEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/enumStringEditor/EnumStringEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/mapEditor/MapEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/iconEditor/IconEditor": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/iconEditor/IconEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/PropertyEditorFactory": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/PropertyEditorFactory"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/binding/resolveBinding": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/binding/resolveBinding"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/ObjectBinding": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/ObjectBinding"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/createPromise": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/createPromise"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/escapeParameter": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/escapeParameter"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/findClosestInstance": {
				group: "Base DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/findClosestInstance"
					]
				},
				sinon: false
			},
			"designtime/cardEditor/CardEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/CardEditor"
					]
				},
				sinon: false
			},
			"designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/propertyEditor/parametersEditor/ParametersEditor"
					]
				},
				sinon: false
			},
			"designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor": {
				group: "Card DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/cardEditor/propertyEditor/complexMapEditor/ComplexMapEditor"
					]
				},
				sinon: false
			}
		}
	};
});
