sap.ui.define(["sap/ui/Device"], function(Device) {

	"use strict";
	return {
		name: "TestSuite for Topic: View & Controller",
		defaults: {
			loader: {
				paths: {
					"testdata/fragments": "test-resources/sap/ui/core/qunit/testdata/fragments/", // fragments used in views

					// @deprecated as of 1.110
					"testdata/fragments_legacyAPIs": "test-resources/sap/ui/core/qunit/testdata/fragments_legacyAPIs/", // fragments used in views
					"testdata/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by async tests

					// @deprecated as of 1.110
					"testdata/mvc_legacyAPIs": "test-resources/sap/ui/core/qunit/mvc_legacyAPIs/testdata",
					"example/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by sync tests

					// @deprecated as of 1.110
					"example/mvc_legacyAPIs": "test-resources/sap/ui/core/qunit/mvc_legacyAPIs/testdata",
					"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/" // used by sync tests
				}
			},
			ui5: {
				libs: ["sap.ui.core", "sap.ui.layout", "sap.m"],
				theme: "sap_fiori_3",
				language: "en"
			}
		},
		tests: {
			AsyncXMLView: {
				title: "QUnit Page for async sap.ui.core.mvc.XMLView"
			},

			Controller: {
				sinon: true
			},

			EventHandlerResolver: {
				title: "QUnit Page for async sap.ui.core.mvc.EventHandlerResolver"
			},

			View: {
				title: "QUnit Page for sap.ui.core.mvc.View"
			},

			XMLView: {
				title: "QUnit Page for sap.ui.core.mvc.XMLView + sap.ui.core.mvc.Controller",
				qunit: {
					reorder: false
				}
			},

			"extensions/Controllerextensions": {
				title: "QUnit Page for Controller Extensions"
			},

			"extensions/Controllerextensions_legacy": {
				title: "QUnit Page for Controller Extensions with old 'override' property"
			},

			"extensions/ControllerMetadata": {
				title: "QUnit Page for Controller Metadata",
				loader: {
					paths: {
						"my/test": "test-resources/sap/ui/core/qunit/mvc/extensions/testdata/"
					}
				}
			},

			"viewprocessing/ViewProcessing": {
				title: "QUnit Page for sap.ui.core.qunit.mvc.viewprocessing.ViewProcessing",
				loader: {
					paths: {
						"sap/ui/core/qunit/mvc/viewprocessing": "test-resources/sap/ui/core/qunit/mvc/viewprocessing/"
					}
				}
			},

			XMLTemplateProcessor: {
				title: "QUnit Page for XMLTemplateProcessor (sync)",
				loader: {
					paths: {
						"my": "test-resources/sap/ui/core/qunit/fragment/"
					}
				}
			},

			XMLTemplateProcessorAsync: {
				title: "QUnit Page for XMLTemplateProcessor (async)",
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/testdata",
						"my": "test-resources/sap/ui/core/qunit/fragment/"
					}
				}
			},

			XMLTemplateProcessorRequireXML: {
				title: "QUnit Page for XMLTemplateProcessor - Require in XML",
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/testdata"
					}
				}
			},

			CacheManager: {
				title: "sap.ui.core.cache.CacheManager",
				module: "test-resources/sap/ui/core/qunit/CacheManager.qunit"
			},

			CommandExecution: {
				title: "sap.ui.core.CommandExecution",
				module: "test-resources/sap/ui/core/qunit/CommandExecution.qunit"
			},

			Fragment: {
				title: "sap.ui.core.Fragment",
				loader: {
					paths: {
						"my": "test-resources/sap/ui/core/qunit/testdata/fragments/views"
					}
				},
				qunit: {
					reorder: false
				},
				module: "test-resources/sap/ui/core/qunit/Fragment.qunit"
			},

			Shortcut: {
				title: "sap.ui.core.Shortcut",
				module: "test-resources/sap/ui/core/qunit/Shortcut.qunit"
			},

			ShortcutHelper: {
				title: "sap.ui.core.util.ShortcutHelper",
				module: "test-resources/sap/ui/core/qunit/ShortcutHelper.qunit"
			},

			ShortcutHints: {
				title: "sap.ui.core.ShortcutHintsMixin",
				loader: {
					paths: {
						"my/hints": "test-resources/sap/ui/core/qunit/testdata/shortcutHints"
					}
				},
				module: "test-resources/sap/ui/core/qunit/ShortcutHints.qunit"
			},

			XMLHelper: {
				title: "sap.ui.core.util.XMLHelper",
				module: "test-resources/sap/ui/core/qunit/util/XMLHelper.qunit"
			},

			LRUPersistentCache: {
				title: "sap.ui.core.cache.LRUPersistentCache",
				autostart: false,
				module: "test-resources/sap/ui/core/qunit/LRUPersistentCache.qunit"
			}
		}
	};
});
