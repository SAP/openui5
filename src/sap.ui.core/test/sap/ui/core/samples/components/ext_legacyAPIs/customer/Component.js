sap.ui.define([
	"samples/components/ext_legacyAPIs/sap/Component"
], function(ExtSapComponent) {
	"use strict";


	var Component = ExtSapComponent.extend("samples.components.ext_legacyAPIs.customer.Component", {

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
					"samples.components.ext_legacyAPIs.sap.Sub1": {
						viewName: "samples.components.ext_legacyAPIs.customer.CustomSub1",
						type: "XML"
					}
				},

				"sap.ui.controllerReplacements": {
					"samples.components.ext_legacyAPIs.sap.Main": "samples.components.ext_legacyAPIs.customer.Main"
				},

				"sap.ui.viewExtensions": {
					"samples.components.ext_legacyAPIs.sap.Sub2": {
						"extension2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.CustomFrag1WithCustomerAction",
							type: "XML"
						},
						"extension3": {
							className: "sap.ui.core.mvc.View",
							viewName: "samples.components.ext_legacyAPIs.customer.CustomSubSubView1",
							type: "XML"
						},
						"extension4": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.MultiRootFragment",
							type: "XML"
						},
						"extension5": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.ListItemFragment",
							type: "XML"
						}
					},
					"samples.components.ext_legacyAPIs.sap.Sub4": {
						"extension42": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.JSCustomFragWithCustomAction",
							type: "JS"
						},
						"extension43": {
							className: "sap.ui.core.mvc.View",
							viewName: "samples.components.ext_legacyAPIs.customer.JSCustomSubSubView",
							type: "JS"
						},
						"extension45": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.CustomTextFrag",
							type: "JS"
						}
					},
					"samples.components.ext_legacyAPIs.customer.CustomSubSubView1": {
						"extension2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.CustomFrag1",
							type: "XML"
						}
					},
					"samples.components.ext_legacyAPIs.customer.JSCustomSubSubView": {
						"extension44": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.MultiRootFragment",
							type: "JS"
						}
					},

					"samples.components.ext_legacyAPIs.sap.Frag1": {
						"epFrag1": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.CustomFrag1",
							type: "XML"
						}
					},

					"samples.components.ext_legacyAPIs.sap.Frag2": {
						"epFrag2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.CustomFrag2",
							type: "XML"
						}
					},

					"samples.components.ext_legacyAPIs.customer.CustomFrag1": {
						"epCustomFrag1": {
							className: "sap.ui.core.Fragment",
							fragmentName: "samples.components.ext_legacyAPIs.customer.CustomFrag2",
							type: "XML"
						}
					}
				},

				"sap.ui.viewModifications": {
					"samples.components.ext_legacyAPIs.sap.Sub3": {
						"customizableText": {
							"visible": false
						}
					},
					"samples.components.ext_legacyAPIs.sap.Sub4": {
						"customizableText1": {
							"visible": false
						}
					},
					"samples.components.ext_legacyAPIs.sap.Sub5": {
						"Button2": {
							"visible": false
						}
					}
				},

				"sap.ui.controllerExtensions": {
					"samples.components.ext_legacyAPIs.sap.Sub2": {
						controllerName: "samples.components.ext_legacyAPIs.customer.Sub2ControllerExtension"
					},
					"samples.components.ext_legacyAPIs.sap.Sub4": {
						controllerName: "samples.components.ext_legacyAPIs.customer.Sub4ControllerExtension"
					}
				}
			}
		}

	});


	return Component;

});
