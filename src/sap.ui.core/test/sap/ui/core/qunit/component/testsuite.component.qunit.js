sap.ui.define(function() {

	"use strict";

	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/CONTROLS",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 1,
				qunitBridge: true,
			},
			loader: {
				paths: {
					local: "test-resources/sap/ui/core/qunit/component/",
					testdata: "test-resources/sap/ui/core/qunit/component/testdata/",
					"samples/components": "test-resources/sap/ui/core/samples/components/"
				}
			},
			ui5: {
				noConflict: true
			},
			bootCore: true
		},
		tests: {
			Cleanup: {
				title: "QUnit test: Component Cleanup",
				ui5: {
					language: "en",
					preload: "async"
				}
			},
			Component: {
				title: "QUnit test: Component",
				ui5: {
					libs: "sap.m",
					language: "en",
					preload: "async"
				},
				sinon: {
					version: 4,
					useFakeTimer: false
				}
			},
			ComponentContainer: {
				title: "QUnit Page for sap.ui.core.ComponentContainer",
				ui5: {
					language: "en",
					noConflict: undefined
				},
				loader: {
					paths: {
					}
				},
			},
			ComponentSupport: {
				title: "Component Support - sap.ui.core",
				qunit: {
					// second test case invalidates (breaks) first one
					reorder: false
				},
				loader: {
					paths: {
						// TODO check whether a common namespace could be used for the fixture
						// internally, the fixtures use "sap.ui.test"
						// ComponentSupport checks for the internal name, therefore it must use the right namespace
						// Other tests only need successful loading, so the name doesn't matter
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata/"
					}
				},
				coverage : {
					only : "[sap/ui/core/ComponentSupport]",
					branchTracking : true
				}
			},
			Customizing: {
				title: "CustomizingConfiguration and Customizing in general - sap.ui.core",
				qunit: {
					// Test seems to make assumptions when customizing data is loaded
					reorder: false
				}
			},
			Customizing_debug: {
				page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}&sap-ui-xx-debugCustomizing",
				title: "CustomizingConfiguration and Customizing in general - sap.ui.core",
				qunit: {
					// Test seems to make assumptions when customizing data is loaded
					reorder: false
				},
				module: [
					"./Customizing.qunit"
				]
			},
			Customizing_disabled: {
				title: "CustomizingConfiguration and Customizing in general - sap.ui.core (customizing disabled)",
				ui5: {
					"xx-disableCustomizing": true
				}
			},
			Customizing_multi: {
				title: "CustomizingConfiguration and Customizing in general - sap.ui.core"
			},
			Manifest: {
				title: "QUnit tests: Component Manifest",
				loader: {
					paths: {
						// TODO check whether a common namespace could be used for the fixture
						// internally, the fixtures use "sap.ui.test"
						// ComponentSupport checks for the internal name, therefore it must use the right namespace
						// Other tests only need successful loading, so the name doesn't matter
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata/"
					}
				}
			},
			Metadata: {
				title: "QUnit tests: Component Metadata",
				loader: {
					paths: {
						// TODO check whether a common namespace could be used for the fixture
						// internally, the fixtures use "sap.ui.test"
						// ComponentSupport checks for the internal name, therefore it must use the right namespace
						// Other tests only need successful loading, so the name doesn't matter
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata/"
					}
				}
			},
			Models: {
				title: "QUnit tests: Component Models",
				ui5: {
					language: "en-US"
				},
				loader: {
					paths: {
						// TODO check whether a common namespace could be used for the fixture
						// internally, the fixtures use "sap.ui.test"
						// ComponentSupport checks for the internal name, therefore it must use the right namespace
						// Other tests only need successful loading, so the name doesn't matter
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata/"
					}
				}
			},
			Preloading: {
				title: "QUnit test: Component (async)",
				ui5: {
					preload: "async",
					language: "en"
				},
				qunit: {
					reorder: false
				}
			},
			UIComponent: {
				_page: "test-resources/sap/ui/core/qunit/component/UIComponent.qunit.html",
				title: "QUnit test: UIComponent",
				ui5: {
					libs: "sap.m",
					language: "en-US"
				}
			}
		}
	};
});
