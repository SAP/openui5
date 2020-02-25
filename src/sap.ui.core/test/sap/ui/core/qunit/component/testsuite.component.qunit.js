sap.ui.define(function() {

	"use strict";

	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/COMPONENT",
		defaults: {
			loader: {
				paths: {
					testdata: "test-resources/sap/ui/core/qunit/component/testdata/",
					// TODO check whether a common namespace can be used for the fixtures
					// Internally, the fixtures use "sap.ui.test", some tests use or rely on that name.
					// Other tests only need successful loading, so the name doesn't matter
					"samples/components": "test-resources/sap/ui/core/samples/components/",
					"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata/",
					"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimer: false
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
					preload: "async" // enforce preloads in dev mode
				}
			},
			Component: {
				title: "QUnit test: Component",
				ui5: {
					libs: "sap.m",
					language: "en",
					preload: "async" // enforce preloads in dev mode
				}
			},
			ComponentContainer: {
				title: "QUnit Page for sap.ui.core.ComponentContainer",
				ui5: {
					language: "en"
				}
			},
			ComponentSupport: {
				title: "Component Support - sap.ui.core",
				qunit: {
					// second test case invalidates (breaks) first one
					reorder: false
				},
				coverage : {
					only : "[sap/ui/core/ComponentSupport]",
					branchTracking : true
				}
			},
			Customizing: {
				title: "CustomizingConfiguration and Customizing in general - sap.ui.core",
				qunit: {
					// Test makes assumptions about when CustomizingData is loaded
					reorder: false
				}
			},
			ExtensionPoint: {
				title: "ExtensionPoints with nProvider",
				qunit: {
					reorder: false
				},
				module: [
					"./ExtensionPoint.qunit"
				]
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
				title: "QUnit tests: Component Manifest"
			},
			Metadata: {
				title: "QUnit tests: Component Metadata"
			},
			Metadata_unavoidablySync: {
				title: "QUnit tests: Component Metadata (sync tests)"
			},
			Models: {
				title: "QUnit tests: Component Models",
				ui5: {
					language: "en-US"
				}
			},
			Preloading: {
				title: "QUnit test: Component (async)",
				qunit: {
					reorder: false
				},
				ui5: {
					language: "en",
					preload: "async" // enforce preloads in dev mode
				}
			},
			UIComponent: {
				title: "QUnit test: UIComponent",
				ui5: {
					libs: "sap.m",
					language: "en-US"
				}
			}
		}
	};
});
