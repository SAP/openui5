sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
	"use strict";


	var Component = UIComponent.extend("testdata.mvc.terminologies.Component", {
		metadata: {
			version: "1.0",
			rootView: {
				viewName: "testdata.mvc.terminologies.Main",
				type: "XML",
				id: "mainView",
				async: true,
				cache: {
					keys: ["key1"]
				}
			},
			customizing: {
			},
			manifest: {
				"sap.ui5": {
					"models": {
						"i18n": {
							"type": "sap.ui.model.resource.ResourceModel",
							"uri": "i18n/i18n.properties",
							"settings": {
								"supportedLanguages": ["en", "de"],
								"terminologies": {
									"oil": {
										"bundleUrl": "i18n/terminologies.oil.i18n.properties",
										"supportedLanguages": ["en"]
									},
									"retail": {
										"bundleUrl": "i18n/terminologies.retail.i18n.properties",
										"supportedLanguages": ["de"]
									}
								},
								"enhanceWith": [
									{
										"bundleUrl": "../appvar1path/i18n/i18n.properties",
										"bundleUrlRelativeTo": "manifest",
										"supportedLanguages": ["en", "de"],
										"terminologies": {
											"oil": {
												"bundleUrl": "../appvar1path/i18n.terminologies.oil.i18n.properties",
												"supportedLanguages": ["en"]
											},
											"retail": {
												"bundleUrl": "../appvar1path/i18n.terminologies.retail.i18n.properties",
												"supportedLanguages": ["de"],
												"bundleUrlRelativeTo": "manifest"
											}
										}
									},
									{
										"bundleName": "appvar2.i18n.i18n.properties",
										"supportedLanguages": ["en", "de"],
										"terminologies": {
											"oil": {
												"bundleName": "appvar2.i18n.terminologies.oil.i18n",
												"supportedLanguages": ["en"]
											},
											"retail": {
												"bundleName": "appvar2.i18n.terminologies.retail.i18n",
												"supportedLanguages": ["de"]
											}
										}
									}
								]
							}
						}
					}
				}
			}
		}
	});

	return Component;

});
