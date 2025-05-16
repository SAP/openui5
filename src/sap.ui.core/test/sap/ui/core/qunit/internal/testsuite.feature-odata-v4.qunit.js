sap.ui.define(function () {
	"use strict";

	return {
		name : "TestSuite for feature-odata-v4",
		defaults : {
			group : "OData V4",
			qunit : {
				versions: {
					"2.18": {
						module: "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css: "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				},
				version : "2.18",
				reorder : false
			},
			sinon : {
				versions: {
					"14.0": {
						module: "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge: "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version : "14.0"
			},
			ui5 : {
				language : "en-US",
				rtl : false,
				libs : [],
				"xx-waitForTheme" : "init"
			},
			coverage : {
				branchTracking : true,
				only : "[SyncPromise,XMLPreprocessor]"
			},
			loader : {
				paths : {
					"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit",
					"sap/ui/core/sample" : "test-resources/sap/ui/core/demokit/sample",
					"sap/ui/test/qunit" : "test-resources/sap/ui/test/qunit"
				}
			},
			autostart : true
		},
		tests : {
			// SyncPromise coverage only via this testsuite:
			// resources/sap/ui/test/starter/Test.qunit.html
			// ?testsuite=test-resources/sap/ui/core/qunit/internal/testsuite.feature-odata-v4.qunit
			// &test=SyncPromise&coverage
			"SyncPromise" : {
				module : ["sap/ui/core/qunit/util/SyncPromise.qunit"]
			},
			"TestUtils" : {
				module : ["sap/ui/test/qunit/TestUtils.qunit"]
			},
			"XMLPreprocessor" : {
				module : ["sap/ui/core/qunit/util/XMLPreprocessor.qunit"]
			},
			// the following tests set autostart=false because they require modules asynchronously
			// and start QUnit on their own
			// the following tests must all be named "OPA.*" so that 1Ring ignores them
			"OPA.ViewTemplate" : {
				autostart : false,
				module : ["sap/ui/core/sample/ViewTemplate/scenario/Opa.qunit"],
				$app : "test-resources/sap/ui/core/demokit/sample/common/index.html?component=ViewTemplate.scenario"
			}
		}
	};
});
