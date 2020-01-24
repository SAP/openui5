sap.ui.define([
], function () {
	"use strict";

	var DEFAULT_INPUT = {
		contextPath: "/ProductCategories('FS')",
		properties: {
			counter: {
				mode: "OneWay",
				model: {
					names: [undefined],
					path: "NumberOfProducts",
					mode: "OneWay",
					type: "sap.ui.model.odata.v2.ODataModel",
					data: {"FeaturedProducts(HT-1000)": {ProductId: "HT-1000"}}
				},
				path: "NumberOfProducts",
				type: "int",
				value: 3
			}
		},
		aggregations: {
			items: {
				model: {
					data: {"Products('HT-2001')": {key: "value"}},
					mode: "OneWay",
					names: [],
					path: "ProductItems",
					type: "sap.ui.model.odata.v2.ODataModel"
				}
			}
		}
	};
	var DEFAULT_OUTPUT = {
		properties: {
			own: [{
				inheritedFrom: "sap.m.Button",
				property: "text",
				value: "test",
				type: "string"
			}],
			inherited: [{
				inheritedFrom: "sap.ui.core.Control",
				property: "busy",
				value: false,
				type: "boolean"
			}]
		},
		bindings: {
			context: [{
				path: "/ProductCategories('FS')",
				model: "default"
			}],
			properties: [{
				property: "counter",
				relativePath: "NumberOfProducts",
				absolutePath: "/ProductCategories('FS')/NumberOfProducts",
				model: "default"
			}],
			aggregations: [{
				aggregation: "items",
				relativePath: "ProductItems",
				absolutePath:  "/ProductCategories('FS')/ProductItems",
				model: "default"
			}]
		}
	};

	return {
		DEFAULT_INPUT: DEFAULT_INPUT,
		DEFAULT_OUTPUT: DEFAULT_OUTPUT,
		getMockData: function (vInput) {
			var sRaw;
			switch (vInput) {
				case "__button4-container-cart---welcomeView--row-1-img":
					// completely mocked
					sRaw = '{\n' +
						'	controlType: "sap.ui.core.Icon",\n' +
						'	viewName: "sap.ui.demo.cart.view.Welcome",\n' +
						'	properties: {\n' +
						'		src: "sap-icon://action"\n' +
						'	}';
					return {
						snippet: {
							UIVERI5: {
								Highlight: "element(by.control(" + sRaw + "\n}));",
								Press: "element(by.control(" + sRaw + "\n})).click();",
								"Enter Text": 'element(by.control(" + sRaw + "\n})).sendKeys("test");'
							},
							RAW: {
								Highlight: sRaw + "\n}",
								Press: sRaw + "\n}",
								"Enter Text": sRaw + "\n}"
							},
							OPA5: {
								Highlight: "this.waitFor(" + sRaw + "\n});",
								Press: "this.waitFor(" + sRaw + ",\n" +
								"	actions: new Press()" + "\n});",
								"Enter Text": "this.waitFor(" + sRaw + ",\n" +
								"	actions: new EnterText({\n" +
								'		text: "test"\n' +
								"	})\n" + "\n});"
							}
						},
						properties: {
							own: [{
								inheritedFrom: "sap.ui.core.Icon",
								property: "src",
								value: "sap-icon://action",
								type: "string"
							}],
							inherited: [{
								inheritedFrom: "sap.ui.core.Control",
								property: "busy",
								value: false,
								type: "boolean"
							}]
						},
						bindings: {
							context: [{
								path: "/ProductCategories('FS')",
								model: "test"
							}]
						}
					};
				case "Button One":
					// as derived from appMock
					sRaw = '{\n' +
						'    controlType: "sap.m.Button",\n' +
						'    viewName: "appMock.view.Main",\n' +
						'    properties: {\n' +
						'        text: "Button One"\n' +
						'    }';
					return {
						snippet: {
							UIVERI5: {
								Highlight: "element(by.control(" + sRaw + "\n}));",
								Press: "element(by.control(" + sRaw + "\n})).click();",
								"Enter Text": 'element(by.control(' + sRaw + '\n})).sendKeys("test");'
							},
							RAW: {
								Highlight: sRaw + "\n}",
								Press: sRaw + "\n}",
								"Enter Text": sRaw + "\n}"
							},
							OPA5: {
								Highlight: "this.waitFor(" + sRaw + "\n});",
								Press: "this.waitFor(" + sRaw + ",\n" +
								"    actions: new Press()" + "\n});",
								"Enter Text": "this.waitFor(" + sRaw + ",\n" +
								"    actions: new EnterText({\n" +
								'        text: "test"\n' +
								"    })" + "\n});"
							}
						},
						properties: {
							own: [{
								inheritedFrom: "sap.m.Button",
								property: "text",
								value: "Button One",
								type: "string"
							}, {
								inheritedFrom: "sap.m.Button",
								property: "enabled",
								value: "true",
								type: "boolean"
							}, {
								inheritedFrom: "sap.m.Button",
								property: "icon",
								value: "",
								type: "sap.ui.core.URI"
							}],
							ownTotalCount: 9
						}
					};
				case "Button With ID -- viewId":
					var sRaw = '{\n' +
					'    id: "stableId",\n' +
					'    viewId: "container-myComponent---main"';
					return {
						snippet: {
							UIVERI5: {
								Highlight: "element(by.control(" + sRaw + "\n}));"
							}
						}
					};
				case "Button With ID -- globalId":
						var sRaw = '{\n' +
						'    id: "container-myComponent---main--stableId"';
						return {
							snippet: {
								UIVERI5: {
									Highlight: "element(by.control(" + sRaw + "\n}));"
								}
							}
						};
					default:
					return DEFAULT_OUTPUT;
			}
		}
	};
});
