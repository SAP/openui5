sap.ui.define(function() {

	"use strict";

	return {
		name: "TestSuite for Topic: Component",
		defaults: {
			loader: {
				paths: {
					"testdata": "test-resources/sap/ui/core/qunit/component/testdata/",
					"samples/components": "test-resources/sap/ui/core/samples/components/"
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

			Component_containedInLibrary: {
				title: "QUnit test: Components contained in a Library",
				ui5: {
					preload: "async"
				}
			},

			Component_keepAlive: {
				title: "QUnit test: Component keepAlive",
				ui5: {
					language: "en"
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
				title: "Customizing in general - sap.ui.core",
				qunit: {
					// Test makes assumptions about when CustomizingData is loaded
					reorder: false
				}
			},

			Customizing_async: {
				title: "Async Customizing - sap.ui.core",
				qunit: {
					reorder: false
				}
			},

			ExtensionPoint: {
				title: "ExtensionPoints with ExtensionProvider",
				qunit: {
					reorder: false
				},
				sinon: {
					version: 4
				}
			},

			Customizing_disabled: {
				title: "Customizing in general - sap.ui.core (customizing disabled)",
				ui5: {
					"xx-disableCustomizing": true
				}
			},

			Customizing_multi: {
				title: "Customizing in general - sap.ui.core"
			},

			Manifest: {
				title: "QUnit tests: Component Manifest"
			},

			Metadata: {
				title: "QUnit tests: Component Metadata"
			},

			Models: {
				title: "QUnit tests: Component Models",
				ui5: {
					language: "en-US"
				},
				qunit: {
					reorder: false
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

			TerminologiesBootstrap: {
				title: "QUnit test: TerminologiesBootstrap",
				ui5: {
					activeTerminologies: ["oil", "retail"],
					preload: "async"
				}
			},

			UIComponent: {
				title: "QUnit test: UIComponent",
				ui5: {
					libs: "sap.m",
					language: "en-US"
				}
			},

			Component_dependencyLoading: {
				title: "QUnit test: Dependency loading",
				qunit: {
					reorder: false
				}
			}
		}
	};
});
