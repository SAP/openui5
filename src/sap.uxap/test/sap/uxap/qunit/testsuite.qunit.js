sap.ui.define(function () {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.uxap",
		defaults: {
			group: "Default",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: "edge"
			},
			ui5: {
				language: "en",
				libs: ["sap.uxap"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/uxap"]
			},
			loader: {
				paths: {
					"qunit": "test-resources/sap/uxap/qunit/",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
					"view": "test-resources/sap/uxap/qunit/view/"
				}
			},
			page: "test-resources/sap/uxap/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"BlockBase": {
				coverage: {
					only: ["sap/uxap/BlockBase"]
				},
				ui5: {
					resourceroots: {
						"blockbasetest": "test-resources/sap/uxap/qunit/blockbasetest/"
					}
				}
			},

			"BlockShowMore": {
				coverage: {
					only: ["sap/uxap/BlockShowMore"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/sample": "test-resources/sap/uxap/demokit/sample/"
					}
				}
			},

			"BreadCrumbs": {
				coverage: {
					only: ["sap/uxap/BreadCrumbs"]
				}
			},

			"ExploredSamples": {
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1 // because MockServer is used by samples
				},
				ui5: {
					libs: ["sap.ui.unified", "sap.ui.documentation", "sap.ui.layout", "sap.m"],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			"EnforceSemanticRendering": {
				title: "QUnit Page for Semantic Rendering Coverage"
			},

			"ObjectPageAPICreation": {
				coverage: {
					only: ["sap/uxap/ObjectPageAPICreation"]
				}
			},

			"ObjectPageContentScrolling": {
				coverage: {
					only: ["sap/uxap/ObjectPageContentScrolling"]
				}
			},

			"ObjectPageFloatingFooter": {
				coverage: {
					only: ["sap/uxap/ObjectPageFloatingFooter"]
				}
			},

			"ObjectPageFormLayout": {
				coverage: {
					only: ["sap/uxap/ObjectPageFormLayout"]
				}
			},

			"ObjectPageHeader": {
				coverage: {
					only: ["sap/uxap/ObjectPageHeader"]
				}
			},

			"ObjectPageHeaderContent": {
				coverage: {
					only: ["sap/uxap/ObjectPageHeaderContent"]
				}
			},

			"ObjectPageInXMLCreation": {
				coverage: {
					only: ["sap/uxap/ObjectPageInXMLCreation"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/sample": "test-resources/sap/uxap/demokit/sample/"
					}
				}
			},

			"ObjectPageKeyboardHandling": {
				coverage: {
					only: ["sap/uxap/ObjectPageKeyboardHandling"]
				}
			},

			"ObjectPageLazyLoading": {
				coverage: {
					only: ["sap/uxap/ObjectPageLazyLoading"]
				}
			},

			"ObjectPageModelMapping": {
				coverage: {
					only: ["sap/uxap/ObjectPageModelMapping"]
				}
			},

			"ObjectPageRules": {
				coverage: {
					only: ["sap/uxap/ObjectPageRules"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/sample": "test-resources/sap/uxap/demokit/sample/"
					}
				}
			},

			"ObjectPageScreenReaderSupport": {
				coverage: {
					only: ["sap/uxap/ObjectPageScreenReaderSupport"]
				}
			},

			"ObjectPageSection": {
				coverage: {
					only: ["sap/uxap/ObjectPageSection"]
				}
			},

			"ObjectPageState": {
				coverage: {
					only: ["sap/uxap/ObjectPageState"]
				}
			},

			"ObjectPageSubSection": {
				coverage: {
					only: ["sap/uxap/ObjectPageSubSection"]
				}
			},

			"ObjectPageSubSectionStashing": {
				coverage: {
					only: ["sap/uxap/ObjectPageSubSectionStashing"]
				}
			},

			"ObjectPageThrottledTask": {
				coverage: {
					only: ["sap/uxap/ObjectPageThrottledTask"]
				}
			},

			// -------------------------------------------------------------------------------
			// Change Handler tests:
			// -------------------------------------------------------------------------------

			"changeHandler/AddIFrameObjectPageLayout": {
				group: "ChangeHandler",
				sinon: {
					version: 1 // sinon-qunit-bridge does not support nested QUnit modules
				},
				coverage: {
					only: ["sap/uxap/changeHandler/AddIFrameObjectPageLayout"]
				},
				ui5: {
					resourceroots: {
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
					}
				}
			},

			// -------------------------------------------------------------------------------
			// Designtime tests:
			// -------------------------------------------------------------------------------

			"Designtime-Library": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/Library.qunit"
			},

			"Designtime-ObjectPageDynamicHeaderTitle": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/ObjectPageDynamicHeaderTitle.qunit"
			},

			"Designtime-ObjectPageHeader": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/ObjectPageHeader.qunit"
			},

			"Designtime-ObjectPageHeaderActionButton": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/ObjectPageHeaderActionButton.qunit"
			},

			"Designtime-ObjectPageLayout": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/ObjectPageLayout.qunit"
			},

			"Designtime-ObjectPageSection": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/ObjectPageSection.qunit"
			},

			"Designtime-ObjectPageSubSection": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/ObjectPageSubSection.qunit"
			},

			"Generic Testsuite": {
				page: "test-resources/sap/uxap/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});
