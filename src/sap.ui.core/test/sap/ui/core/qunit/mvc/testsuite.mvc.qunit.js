sap.ui.define(["sap/ui/Device"], function(Device) {

	"use strict";
	return {
		name: "TestSuite for Topic: View & Controller",
		defaults: {
			loader: {
				paths: {
					"testdata/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by async tests
					"example/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by sync tests
					"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/" // used by sync tests
				}
			}
		},
		tests: {
			AsyncHTMLView: {
				title: "QUnit Page for async sap.ui.core.mvc.HTMLView",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			AsyncJSONView: {
				title: "QUnit Page for async sap.ui.core.mvc.JSONView",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			AsyncJSView: {
				title: "QUnit Page for async sap.ui.core.mvc.JSView",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			AsyncXMLView: {
				title: "QUnit Page for async sap.ui.core.mvc.XMLView",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			Controller: {
				sinon: true
			},
			EventHandlerResolver: {
				title: "QUnit Page for async sap.ui.core.mvc.EventHandlerResolver"
			},
			HTMLView: {
				title: "QUnit Page for sap.ui.core.mvc.HTMLView + sap.ui.core.mvc.Controller",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				sinon: false
			},
			JSONView: {
				title: "QUnit Page for sap.ui.core.mvc.JSONView + sap.ui.core.mvc.Controller",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				sinon: false
			},
			JSView: {
				title: "QUnit Page for sap.ui.core.mvc.JSView + sap.ui.core.mvc.Controller",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				sinon: false
			},
			View: {
				title: "QUnit Page for sap.ui.core.mvc.View"
			},
			XMLView: {
				title: "QUnit Page for sap.ui.core.mvc.XMLView + sap.ui.core.mvc.Controller",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				qunit: {
					reorder: false
				}
			},
			"extensions/Controllerextensions": {
				title: "QUnit Page for Controller Extensions"
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
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						"sap/ui/core/qunit/mvc/viewprocessing": "test-resources/sap/ui/core/qunit/mvc/viewprocessing/"
					}
				}
			},
			XMLTemplateProcessor: {
				title: "QUnit Page for XMLTemplateProcessor (sync)",
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						"my": "test-resources/sap/ui/core/qunit/fragment/"
					}
				}
			},
			XMLTemplateProcessorAsync: {
				title: "QUnit Page for XMLTemplateProcessor (async)",
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/testdata",
						"my": "test-resources/sap/ui/core/qunit/fragment/"
					}
				}
			},
			XMLTemplateProcessorRequireXML: {
				title: "QUnit Page for XMLTemplateProcessor - Require in XML",
				ui5: {
					libs: "sap.m"
				},
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
			Declarative: {
				title: "sap.ui.core.DeclarativeSupport",
				// we keep the HTML page here, because of the complex test fixture
				page: "test-resources/sap/ui/core/qunit/Declarative.qunit.html",
				ui5: {
					libs: "sap.ui.commons,sap.ui.ux3"
				},
				module: "test-resources/sap/ui/core/qunit/Declarative.qunit"
			},
			Fragment: {
				title: "sap.ui.core.Fragment",
				loader: {
					paths: {
						"testdata/fragments": "test-resources/sap/ui/core/qunit/testdata/fragments/",
						"my": "test-resources/sap/ui/core/qunit/fragment/"
					}
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
