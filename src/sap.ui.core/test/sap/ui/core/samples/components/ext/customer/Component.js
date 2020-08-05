sap.ui.define(['samples/components/ext/sap/Component'],
	function(ExtSapComponent) {
	"use strict";


	var Component = ExtSapComponent.extend("samples.components.ext.customer.Component", {

		metadata : {
			version : "1.0",
			config: {
				"customer.config": {
					"key1": "value1"
				},
				"myConfig": {
					"key2": {
						"subKey1": "subValue1"
					}
				}
			},

			customizing: {

				"sap.ui.viewReplacements": {
					"samples.components.ext.sap.Sub1": {
						viewName: "samples.components.ext.customer.CustomSub1",
						type: "XML"
					}
				},

				"sap.ui.controllerReplacements": {
					"samples.components.ext.sap.Main": "samples.components.ext.customer.Main"
				},

				"sap.ui.viewExtensions": {
					"samples.components.ext.sap.Sub2": {
						"extension2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.CustomFrag1WithCustomerAction",
							type: "XML"
						},
						"extension3": {
							className: "sap.ui.core.mvc.View",
							viewName: "samples.components.ext.customer.CustomSubSubView1",
							type: "XML"
						},
						"extension4": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.MultiRootFragment",
							type: "XML"
						},
						"extension5": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.ListItemFragment",
							type: "XML"
						}
					},
					"samples.components.ext.sap.Sub4": {
						"extension42": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.JSCustomFragWithCustomAction",
							type: "JS"
						},
						"extension43": {
							className: "sap.ui.core.mvc.View",
							viewName: "samples.components.ext.customer.JSCustomSubSubView",
							type: "JS"
						},
						"extension45": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.CustomTextViewFrag",
							type: "JS"
						}
					},
					"samples.components.ext.customer.CustomSubSubView1": {
						"extension2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.CustomFrag1",
							type: "XML"
						}
					},
					"samples.components.ext.customer.JSCustomSubSubView": {
						"extension44": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.MultiRootFragment",
							type: "JS"
						}
					},

					"samples.components.ext.sap.Frag1": {
						"epFrag1": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.CustomFrag1",
							type: "XML"
						}
					},

					"samples.components.ext.sap.Frag2": {
						"epFrag2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.CustomFrag2",
							type: "XML"
						}
					},

					"samples.components.ext.customer.CustomFrag1": {
						"epCustomFrag1": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext.customer.CustomFrag2",
							type: "XML"
						}
					}
				},

				"sap.ui.viewModifications": {
					"samples.components.ext.sap.Sub3": {
						"customizableText": {
							"visible": false
						}
					},
					"samples.components.ext.sap.Sub4": {
						"customizableText1": {
							"visible": false
						}
					},
					"samples.components.ext.sap.Sub5": {
						"Button2": {
							"visible": false
						}
					}
				},

				"sap.ui.controllerExtensions": {
					"samples.components.ext.sap.Sub2": {
						controllerName: "samples.components.ext.customer.Sub2ControllerExtension"
					},
					"samples.components.ext.sap.Sub4": {
						controllerName: "samples.components.ext.customer.Sub4ControllerExtension"
					}
				}
			}
		}

	});


	return Component;

});
