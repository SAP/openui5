sap.ui.define([
	"testdata/customizing/sap/Component"
], function(SapComponent) {
	"use strict";


	var Component = SapComponent.extend("testdata.customizing.customer.Component", {

		metadata : {
			version : "1.0",
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			customizing: {

				"sap.ui.viewReplacements": {
					"testdata.customizing.sap.Sub1": {
						viewName: "testdata.customizing.customer.CustomSub1",
						type: "XML"
					},
					"testdata.customizing.sap.JSSub1": {
						viewName: "testdata.customizing.customer.CustomSub1",
						type: "JS"
					}
				},

				"sap.ui.controllerReplacements": {
					"testdata.customizing.sap.Main": "testdata.customizing.customer.Main"
				},

				"sap.ui.viewExtensions": {
					"testdata.customizing.sap.Sub2": {
						"extension2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.CustomFrag1WithCustomerAction",
							type: "XML"
						},
						"extension21": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.CustomFrag21",
							type: "XML"
						},
						"extension3": {
							className: "sap.ui.core.mvc.View",
							viewName: "testdata.customizing.customer.CustomSubSubView1",
							type: "XML",
							id: "customSubSubView1"
						},
						"extension4": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.MultiRootFragment",
							type: "XML"
						},
						"extension5": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.ListItemFragment",
							type: "XML"
						}
					},
					"testdata.customizing.sap.Sub4": {
						"extension42": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.JSCustomFragWithCustomAction",
							type: "JS"
						},
						"extension43": {
							className: "sap.ui.core.mvc.View",
							viewName: "testdata.customizing.customer.JSCustomSubSubView",
							type: "JS"
						},
						"extension45": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.CustomTextFrag",
							type: "JS"
						}
					},
					"testdata.customizing.sap.Sub4Typed": {
						"extension42": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.JSCustomFragWithCustomAction",
							type: "JS"
						},
						"extension43": {
							className: "sap.ui.core.mvc.View",
							viewName: "module:testdata/customizing/customer/TypedCustomSubSubView"
						},
						"extension45": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.CustomTextFrag",
							type: "JS"
						}
					},
					"testdata.customizing.customer.CustomSubSubView1": {
						"extension2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.CustomFrag1",
							type: "XML"
						}
					},

					"testdata.customizing.sap.Frag1": {
						"extensionPointInFragment": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.CustomFrag1",
							type: "XML"
						}
					},
					"testdata.customizing.customer.JSCustomSubSubView": {
						"extension44": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customer.MultiRootFragment",
							type: "JS"
						}
					}
				},

				"sap.ui.viewModifications": {
					"testdata.customizing.sap.Sub2": {
						"btnToHide": {
							"visible": false
						}
					},
					"testdata.customizing.sap.Sub3": {
						"customizableText": {
							"visible": false
						}
					},
					"testdata.customizing.sap.Sub4": {
						"customizableText1": {
							"visible": false
						}
					},
					"testdata.customizing.sap.Sub4Typed": {
						"typedCustomizableText1": {
							"visible": false
						}
					},
					"testdata.customizing.sap.Sub5": {
						"Button2": {
							"visible": false
						}
					}
				},

				"sap.ui.controllerExtensions": {
					/**
					 * @deprecated As of 1.110
					 */
					"testdata.customizing.sap.Sub2_legacyAPIs": {
						"controllerName": "testdata.customizing.customer.Sub2ControllerExtension_legacyAPIs"
					},
					"testdata.customizing.sap.Sub2": {
						"controllerName": "testdata.customizing.customer.Sub2ControllerExtension"
					},
					"testdata.customizing.sap.Sub4": {
						"controllerNames": [
							"testdata.customizing.customer.Sub4ControllerExtension"
						]
					},
					"testdata.customizing.sap.Sub4Typed": {
						"controllerNames": [
							"testdata.customizing.customer.Sub4ControllerExtension"
						]
					},
					"testdata.customizing.sap.Sub6": {
						"controllerName": "testdata.customizing.customer.Sub6ControllerExtension",
						"controllerNames": [
							"testdata.customizing.customer.Sub6AnotherControllerExtension"
						]
					},
					"testdata.customizing.sap.Sub6#mainView--sub6View": {
						"controllerNames": [
							"testdata.customizing.customer.Sub6InstanceSpecificControllerExtension"
						]
					}
				}
			}
		}

	});


	return Component;

});
