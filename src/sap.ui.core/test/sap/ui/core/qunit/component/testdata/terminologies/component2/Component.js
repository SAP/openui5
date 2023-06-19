sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("testdata.terminologies.component2.Component", {
			metadata: {
				version: "1.0",
				rootView: {
					viewName: "testdata.terminologies.component2.Main",
					type: "XML",
					id: "mainView",
					async: true
				},
				customizing: {
				},
				manifest: {
					"sap.app" : {
						"id": "testdata.terminologies.component2",
						"type": "application",
						"title": "{{appTitle}}",
						"i18n": {
							"bundleUrl": "i18n/i18n.properties",
							"supportedLocales": ["en", "de"],
							"fallbackLocale": "en",
							"terminologies": {
								"oil": {
									"bundleUrl": "i18n/terminologies.oil.i18n.properties",
									"supportedLocales": ["en"]
								},
								"retail": {
									"bundleUrl": "i18n/terminologies.retail.i18n.properties",
									"supportedLocales": ["de"]
								}
							},
							"enhanceWith": [
								{
									"bundleUrl": "../appvar1path/i18n/i18n.properties",
									"bundleUrlRelativeTo": "manifest",
									"supportedLocales": ["en", "de"],
									"fallbackLocale": "en",
									"terminologies": {
										"oil": {
											"bundleUrl": "../appvar1path/i18n.terminologies.oil.i18n.properties",
											"supportedLocales": ["en"]
										},
										"retail": {
											"bundleUrl": "../appvar1path/i18n.terminologies.retail.i18n.properties",
											"supportedLocales": ["de"],
											"bundleUrlRelativeTo": "manifest"
										}
									}
								},
								{
									"bundleName": "appvar2.i18n.i18n.properties",
									"supportedLocales": ["en", "de"],
									"fallbackLocale": "en",
									"terminologies": {
										"oil": {
											"bundleName": "appvar2.i18n.terminologies.oil.i18n",
											"supportedLocales": ["en"]
										},
										"retail": {
											"bundleName": "appvar2.i18n.terminologies.retail.i18n",
											"supportedLocales": ["de"]
										}
									}
								}
							]
						}
					},
					"sap.ui5": {
						"models": {
						}
					}
				}
			}
		});
	});
