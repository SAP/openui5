sap.ui.define(function () {
	"use strict";
	return {
		name: "sap.ui.dt",
		defaults: {
			group: "Default",
			qunit: {
				version: 2
			},
			sinon: false,
			ui5: {
				language: "en",
				libs: ["sap.ui.dt"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/ui/dt"],
				branchTracking: true
			},
			page: "test-resources/sap/ui/dt/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"AggregationDesignTimeMetadata": {
				coverage: {
					only: ["sap/ui/dt/AggregationDesignTimeMetadata"]
				}
			},
			"AggregationOverlay": {
				coverage: {
					only: ["sap/ui/dt/AggregationOverlay"]
				}
			},
			"ControlObserver": {
				coverage: {
					only: ['sap/ui/dt/ControlObserver']
				}
			},
			"DesignTime": {
				coverage: {
					only: ['sap/ui/dt/DesignTime']
				},
				ui5: {
					resourceroots: {
						"qunit": "test-resources/sap/ui/dt/qunit/"
					}
				}
			},
			"DesignTimeMetadata": {
				coverage: {
					only: ['sap/ui/dt/DesignTimeMetadata']
				}
			},
			"DOMUtil": {
				coverage: {
					only: ['sap/ui/dt/DOMUtil']
				}
			},
			"DOMUtilRtl": {
				coverage: {
					only: ['sap/ui/dt/DOMUtil']
				},
				ui5: {
					rtl: true
				}
			},
			"ElementDesignTimeMetadata": {
				coverage: {
					only: ['sap/ui/dt/ElementDesignTimeMetadata']
				}
			},
			"ElementOverlay": {
				coverage: {
					only: ['sap/ui/dt/ElementOverlay']
				},
				ui5: {
					resourceroots: {
						"dt.control": "test-resources/sap/ui/dt/qunit/testdata/controls/"
					}
				}
			},
			"ElementOverlayRTL": {
				coverage: {
					only: ['sap/ui/dt/ElementOverlay']
				},
				ui5: {
					rtl: true
				}
			},
			"ElementUtil": {
				coverage: {
					only: ['sap/ui/dt/ElementUtil']
				}
			},

			"MetadataPropagationUtil": {
				coverage: {
					only: ['sap/ui/dt/MetadataPropagationUtil']
				},
				ui5: {
					resourceroots: {
						"qunit": "test-resources/sap/ui/dt/qunit/"
					}
				}
			},
			"MutationObserver": {
				coverage: {
					only: ['sap/ui/dt/MutationObserver']
				}
			},
			"OverlayRegistry": {
				coverage: {
					only: ['sap/ui/dt/OverlayRegistry']
				}
			},
			"OverlayUtil": {
				coverage: {
					only: ['sap/ui/dt/OverlayUtil']
				}
			},
			"Plugin": {
				coverage: {
					only: ['sap/ui/dt/Plugin']
				}
			},
			"ScrollbarSynchronizer": {
				coverage: {
					only: ['sap/ui/dt/ScrollbarSynchronizer']
				}
			},
			"SelectionManager": {
				coverage: {
					only: ['sap/ui/dt/SelectionManager']
				}
			},
			"TaskManager": {
				coverage: {
					only: ['sap/ui/dt/TaskManager']
				}
			},
			"ManagedObjectObserver": {
				coverage: {
					only: ['sap/ui/dt/ManagedObjectObserver']
				}
			},
			"Util": {
				coverage: {
					only: ["sap/ui/dt/Util"]
				}
			},
			"util/getNextZIndex": {
				coverage: {
					only: ["sap/ui/dt/util/getNextZIndex"]
				}
			},

			// -------------------------------------------------------------------------------
			// Plugin tests:
			// -------------------------------------------------------------------------------
			"plugin/ContextMenu": {
				group: "Plugin",
				coverage: {
					only: ['sap/ui/dt/plugin/ContextMenu']
				}
			},
			"plugin/CutPaste": {
				group: "Plugin",
				coverage: {
					only: ['sap/ui/dt/plugin/CutPaste']
				}
			},
			"plugin/DragDrop": {
				group: "Plugin",
				coverage: {
					only: ['sap/ui/dt/plugin/DragDrop']
				}
			},
			"plugin/ElementMover": {
				group: "Plugin",
				coverage: {
					only: ['sap/ui/dt/plugin/ElementMover']
				}
			},
			"plugin/TabHandling": {
				group: "Plugin",
				coverage: {
					only: ['sap/ui/dt/plugin/TabHandling']
				}
			},
			"plugin/ToolHooks": {
				group: "Plugin",
				coverage: {
					only: ['sap/ui/dt/plugin/ToolHooks']
				}
			},

			// -------------------------------------------------------------------------------
			// Integration tests:
			// -------------------------------------------------------------------------------
			"integration/FormInDesignTime": {
				group: "Integration"
			},
			"integration/IconTabBarInDesignTime": {
				group: "Integration"
			},
			"integration/ObjectPage": {
				group: "Integration"
			},
			"integration/SimpleFormInDesignTime": {
				group: "Integration"
			},
			"integration/SimpleForm": {
				group: "Integration",
				ui5: {
					resourceroots: {
						"dt/view": "test-resources/sap/ui/dt/qunit/testdata/designtime/"
					}
				}
			},
			"integration/InvisibleControls": {
				group: "Integration"
			},
			"integration/TablesInDesignTime": {
				group: "Integration"
			},
			"integration/ComponentContainerInDesignTime": {
				group: "Integration"
			},
			"integration/ControlMovement": {
				group: "Integration"
			},

			// -------------------------------------------------------------------------------
			// Validator tests:
			// -------------------------------------------------------------------------------
			"test/Element": {
				group: "Validator",
				coverage: {
					only: ['sap/ui/dt/test']
				}
			},
			"test/ElementEnablement": {
				group: "Validator",
				coverage: {
					only: ['sap/ui/dt/test']
				}
			},
			"test/LibraryEnablementTest": {
				group: "Validator",
				ui5: {
					resourceroots: {
						"dt.control": "test-resources/sap/ui/dt/qunit/testdata/controls/",
						"sap.ui.testLibrary": "test-resources/sap/ui/dt/qunit/testdata/"
					}
				},
				coverage: {
					only: ['sap/ui/dt/test']
				}
			},
			"test/LibraryEnablementTest2": {
				group: "Validator",
				ui5: {
					resourceroots: {
						"dt.control": "test-resources/sap/ui/dt/qunit/testdata/controls/",
						"sap.ui.testLibrary": "test-resources/sap/ui/dt/qunit/testdata/"
					}
				},
				coverage: {
					only: ['sap/ui/dt/test']
				}
			},
			"test/report/QUnit": {
				group: "Validator",
				coverage: {
					only: ['sap/ui/dt/test']
				}
			},
			"test/report/Table": {
				group: "Validator",
				ui5: {
					resourceroots: {
						"dt.control": "test-resources/sap/ui/dt/qunit/testdata/controls/",
						"sap.ui.testLibrary": "test-resources/sap/ui/dt/qunit/testdata/"
					}
				},
				coverage: {
					only: ['sap/ui/dt/test']
				}
			},
			"test/report/Statistic": {
				group: "Validator",
				coverage: {
					only: ['sap/ui/dt/test']
				}
			}
		}
	};
});