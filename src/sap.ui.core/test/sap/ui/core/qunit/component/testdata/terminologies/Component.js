sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
    function (jQuery, UIComponent) {
        "use strict";

        return UIComponent.extend("testdata.terminologies.Component", {
            metadata: {
                version: "1.0",
                rootView: {
                    viewName: "testdata.terminologies.Main",
                    type: "XML",
                    id: "mainView",
                    async: true
                },
                customizing: {
                },
                manifest: {
                    "sap.ui5": {
                        "componentUsages": {
                            "myReusedTerminologies": {
                                "name": "testdata.terminologies.reuse"
                            },
                            "myReusedTerminologies2": {
                                "name": "testdata.terminologies.reuse",
                                "activeTerminologies": ["fashion"]
                            }
                        },
                        "models": {
                            "i18n": {
                                "type": "sap.ui.model.resource.ResourceModel",
                                "bundleUrl": "i18n/i18n.properties",
                                "settings": {
                                    "supportedLocales": ["en", "de"],
                                    "fallbackLocale": "es",
                                    "terminologies": {
                                        "oil": {
                                            "bundleUrl": "i18n/terminologies.oil.i18n.properties",
                                            "supportedLocales": ["en"],
                                            "fallbackLocale": "es"
                                        },
                                        "retail": {
                                            "bundleUrl": "i18n/terminologies.retail.i18n.properties",
                                            "supportedLocales": ["de"],
                                            "fallbackLocale": "es"
                                        }
                                    },
                                    "enhanceWith": [
                                        {
                                            "bundleUrl": "../appvar1path/i18n/i18n.properties",
                                            "bundleUrlRelativeTo": "manifest",
                                            "supportedLocales": ["en", "de"],
                                            "fallbackLocale": "es",
                                            "terminologies": {
                                                "oil": {
                                                    "bundleUrl": "../appvar1path/i18n.terminologies.oil.i18n.properties",
                                                    "supportedLocales": ["en"],
                                                    "fallbackLocale": "es"
                                                },
                                                "retail": {
                                                    "bundleUrl": "../appvar1path/i18n.terminologies.retail.i18n.properties",
                                                    "supportedLocales": ["de"],
                                                    "fallbackLocale": "es",
                                                    "bundleUrlRelativeTo": "manifest"
                                                }
                                            }
                                        },
                                        {
                                            "bundleName": "appvar2.i18n.i18n.properties",
                                            "supportedLocales": ["en", "de"],
                                            "fallbackLocale": "es",
                                            "terminologies": {
                                                "oil": {
                                                    "bundleName": "appvar2.i18n.terminologies.oil.i18n",
                                                    "supportedLocales": ["en"],
                                                    "fallbackLocale": "es"
                                                },
                                                "retail": {
                                                    "bundleName": "appvar2.i18n.terminologies.retail.i18n",
                                                    "supportedLocales": ["de"],
                                                    "fallbackLocale": "es"
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
    });
