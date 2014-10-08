jQuery.sap.declare("testdata.customizing.customer.Component");
jQuery.sap.require("testdata.customizing.sap.Component");

testdata.customizing.sap.Component.extend("testdata.customizing.customer.Component", {

	metadata : {
		version : "1.0",
		
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
					"extension3": {
						className: "sap.ui.core.mvc.View",
						viewName: "testdata.customizing.customer.CustomSubSubView1",
						type: "XML"
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
						fragmentName: "testdata.customizing.customer.CustomTextViewFrag",
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
				},
			},
			
			"sap.ui.viewModifications": {
				"testdata.customizing.sap.Sub3": {
					"customizableText": {
						"visible": false,
						"enabled": false // this should NOT work!! Only visible.
					}
				},
				"testdata.customizing.sap.Sub4": {
					"customizableText1": {
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
				"testdata.customizing.sap.Sub2": {
					"controllerName": "testdata.customizing.customer.Sub2ControllerExtension"
				},
				"testdata.customizing.sap.Sub4": {
					"controllerName": "testdata.customizing.customer.Sub4ControllerExtension"
				}
			}
		}
	}

});
