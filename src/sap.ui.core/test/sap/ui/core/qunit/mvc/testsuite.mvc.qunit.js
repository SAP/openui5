sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/MVC",
		defaults: {
			loader: {
				paths: {
					"testdata/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by async tests
					"example/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by sync tests
					"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/" // used by sync tests
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true
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
				qunit: {
					reorder: false
				},
				sinon: false
			},
			JSONView: {
				title: "QUnit Page for sap.ui.core.mvc.JSONView + sap.ui.core.mvc.Controller",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				qunit: {
					reorder: false
				},
				sinon: false
			},
			JSView: {
				title: "QUnit Page for sap.ui.core.mvc.JSView + sap.ui.core.mvc.Controller",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				qunit: {
					reorder: false
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
			"extensions/ControllerExtensions": {
				title: "QUnit Page for Controller Extensions",
				module: "./extensions/Controllerextensions.qunit"
			},
			"extensions/ControllerMetadata": {
				title: "QUnit Page for Controller Extensions",
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
			}
		}
	};
});
