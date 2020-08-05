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
				version: 1
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
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"qunit": "test-resources/sap/uxap/qunit/"
				}
			},
			page: "test-resources/sap/uxap/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"AnchorBar": {
				coverage: {
					only: ["sap/uxap/AnchorBar"]
				},
				ui5: {
					resourceroots: {
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"BlockBase": {
				coverage: {
					only: ["sap/uxap/BlockBase"]
				},
				ui5: {
					resourceroots: {
						"blockbasetest": "test-resources/sap/uxap/qunit/blockbasetest/",
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"BlockShowMore": {
				coverage: {
					only: ["sap/uxap/BlockShowMore"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/sample": "test-resources/sap/uxap/demokit/sample/",
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
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
			"ObjectPageAPICreation": {
				coverage: {
					only: ["sap/uxap/ObjectPageAPICreation"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageContentScrolling": {
				coverage: {
					only: ["sap/uxap/ObjectPageContentScrolling"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageFloatingFooter": {
				coverage: {
					only: ["sap/uxap/ObjectPageFloatingFooter"]
				},
				ui5: {
					resourceroots: {
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageFormLayout": {
				coverage: {
					only: ["sap/uxap/ObjectPageFormLayout"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageHeader": {
				coverage: {
					only: ["sap/uxap/ObjectPageHeader"]
				},
				ui5: {
					resourceroots: {
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageHeaderContent": {
				coverage: {
					only: ["sap/uxap/ObjectPageHeaderContent"]
				},
				ui5: {
					resourceroots: {
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageInXMLCreation": {
				coverage: {
					only: ["sap/uxap/ObjectPageInXMLCreation"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/sample": "test-resources/sap/uxap/demokit/sample/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageKeyboardHandling": {
				coverage: {
					only: ["sap/uxap/ObjectPageKeyboardHandling"]
				},
				ui5: {
					resourceroots: {
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageLazyLoading": {
				coverage: {
					only: ["sap/uxap/ObjectPageLazyLoading"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageModelMapping": {
				coverage: {
					only: ["sap/uxap/ObjectPageModelMapping"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageRules": {
				coverage: {
					only: ["sap/uxap/ObjectPageRules"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/sample": "test-resources/sap/uxap/demokit/sample/",
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageScreenReaderSupport": {
				coverage: {
					only: ["sap/uxap/ObjectPageScreenReaderSupport"]
				},
				ui5: {
					resourceroots: {
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageSection": {
				coverage: {
					only: ["sap/uxap/ObjectPageSection"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageState": {
				coverage: {
					only: ["sap/uxap/ObjectPageState"]
				},
				ui5: {
					resourceroots: {
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageSubSection": {
				coverage: {
					only: ["sap/uxap/ObjectPageSubSection"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageSubSectionStashing": {
				coverage: {
					only: ["sap/uxap/ObjectPageSubSectionStashing"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},
			"ObjectPageThrottledTask": {
				coverage: {
					only: ["sap/uxap/ObjectPageThrottledTask"]
				}
			},
			"ObjectPageWithLazyLoadingTabs": {
				coverage: {
					only: ["sap/uxap/ObjectPageWithLazyLoadingTabs"]
				},
				ui5: {
					resourceroots: {
						"sap/uxap/testblocks": "test-resources/sap/uxap/qunit/blocks/",
						"view": "test-resources/sap/uxap/qunit/view/"
					}
				}
			},

			// -------------------------------------------------------------------------------
			// Change Handler tests:
			// -------------------------------------------------------------------------------

			"changeHandler/AddIFrameObjectPageLayout": {
				group: "ChangeHandler",
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
			}
		}
	};
});
