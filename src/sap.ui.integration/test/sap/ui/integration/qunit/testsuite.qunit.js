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
				"xx-waitForTheme": "init",
				"xx-supportedLanguages": ""
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
					'./util/CardFormatters.qunit'
				]
			},
			"AllCards": {
				ui5: {
					libs: ["sap.ui.integration"]
				},
				coverage: {
					only: [
						"sap/f/cards/Header",
						"sap/f/cards/HeaderRenderer",
						"sap/f/cards/IconFormatter",
						"sap/f/cards/NumericHeader",
						"sap/f/cards/NumericHeaderRenderer",
						"sap/f/cards/NumericSideIndicator",
						"sap/f/cards/NumericSideIndicatorRenderer",
						"sap/ui/integration/widgets/Card",
						"sap/ui/integration/util/CardActions",
						"sap/ui/integration/util/CardManifest",
						"sap/ui/integration/util/ServiceManager",
						"sap/ui/integration/customElements/",
						"sap/ui/integration/cards/CalendarCard",
						"sap/ui/integration/cards/AdaptiveCard",
						"sap/ui/integration/cards/AnalyticalContent",
						"sap/ui/integration/util/BindingHelper",
						"sap/ui/integration/util/BindingResolver",
						"sap/ui/integration/cards/ComponentContent",
						"sap/ui/integration/util/DataProvider",
						"sap/ui/integration/util/DataProviderFactory",
						"sap/ui/integration/cards/ListContent",
						"sap/ui/integration/cards/ObjectContent",
						"sap/ui/integration/util/RequestDataProvider",
						"sap/ui/integration/util/ServiceDataProvider",
						"sap/ui/integration/cards/TableContent",
						"sap/ui/integration/cards/BaseContent"
					]
				},
				module: [
					'./Card.qunit',
					'./CardDataHandling.qunit',
					'./util/CardManifest.qunit',
					'./util/ServiceManager.qunit',
					'./customElements/CustomElements.qunit',
					'./util/BindingHelper.qunit',
					'./util/BindingResolver.qunit',
					'./util/DataProvider.qunit',
					'./util/CardActions.qunit',
					'./cardbundle/CardStaticResources.qunit',
					'./util/CardFormatters.qunit',
					'./cards/BaseContent.qunit',
					'./bindingFeatures/DateRange.qunit'
				]
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
						"sap/ui/integration/cards/BaseContent",
						"sap/ui/integration/cards/loading/LoadingProvider"
					]
				},
				module: [
					'./loading/CardLoading.qunit'
				]
			},
			"UI5InputText": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputText"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputText.qunit'
				]
			},
			"UI5InputNumber": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputNumber"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputNumber.qunit'
				]
			},
			"UI5InputToggle": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputToggle"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputToggle.qunit'
				]
			},
			"UI5InputDate": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputDate"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputDate.qunit'
				]
			},
			"UI5InputChoiceSet": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/elements/UI5InputChoiceSet"]
				},
				module: [
					'./cards/AdaptiveContent/UI5InputChoiceSet.qunit'
				]
			},
			"ActionRender": {
				coverage: {
					only: ["sap/ui/integration/cards/adaptivecards/overwrites/ActionRender"]
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
			"bindingFeatures/DateRange": {
				coverage: {
					only: ["sap/ui/integration/bindingFeatures/DateRange"]
				}
			},
			"cardbundle/CardStaticResources": {},
			"cards/AdaptiveCard": { },
			"cards/AnalyticalCard": { },
			"cards/CalendarCard": { },
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
			"util/BindingHelper": {
				coverage: {
					only: ["sap/ui/integration/util/BindingHelper"]
				}
			},
			"util/BindingResolver": {
				coverage: {
					only: ["sap/ui/integration/util/BindingResolver"]
				}
			},
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
			"util/DataProvider": {
				coverage: {
					only: [
						"sap/ui/integration/util/DataProviderFactory",
						"sap/ui/integration/util/DataProvider",
						"sap/ui/integration/util/RequestDataProvider",
						"sap/ui/integration/util/ServiceDataProvider"
					]
				},
				sinon: {
					version: "edge"
				}
			},
			"util/ServiceManager": {
				coverage: {
					only: [
						"sap/ui/integration/util/ServiceManager"
					]
				}
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
			"designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor"
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
			"designtime/baseEditor/propertyEditor/dateEditor/DateEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/dateTimeEditor/DateTimeEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/dateTimeEditor/DateTimeEditor"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/propertyEditor/listEditor/ListEditor": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/propertyEditor/listEditor/ListEditor"
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
			"designtime/baseEditor/util/isValidBindingString": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/isValidBindingString"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/unset": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/unset"
					]
				},
				sinon: false
			},
			"designtime/baseEditor/util/hasTag": {
				group: "DesignTime Editor",
				coverage: {
					only: [
						"sap/ui/integration/designtime/baseEditor/util/hasTag"
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
