sap.ui.define(function () {
	"use strict";

	return {
		name : "TestSuite for feature-odata-v4",
		defaults : {
			group : "OData V4",
			qunit : {
				version : "edge",
				reorder : false
			},
			sinon : {
				version : "edge"
			},
			ui5 : {
				language : "en-US",
				rtl : false,
				libs : null,
				"xx-waitForTheme" : "init"
			},
			coverage : {
				branchTracking : true,
				only : "[SyncPromise,XMLPreprocessor]"
			},
			loader : {
				paths : {
					"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit",
					"sap/ui/test/qunit" : "test-resources/sap/ui/test/qunit"
				}
			},
			autostart : true
		},
		tests : {
			"SyncPromise" : {
				module : ["sap/ui/core/qunit/util/SyncPromise.qunit"]
			},
			"TestUtils" : {
				module : ["sap/ui/test/qunit/TestUtils.qunit"]
			},
			"XMLPreprocessor" : {
				module : ["sap/ui/core/qunit/util/XMLPreprocessor.qunit"]
			}
		}
	};
});
