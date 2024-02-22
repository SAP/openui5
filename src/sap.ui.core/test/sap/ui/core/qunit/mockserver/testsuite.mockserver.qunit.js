sap.ui.define([
	"sap/base/util/merge"
], function (merge) {
	"use strict";

	var oCommonTests = {
		MockServer: {
			title: "Tests for sap/ui/core/util/MockServer",
			module: "./MockServer.qunit",
			ui5: {
				libs: ["sap.m"]
			}
		},
		MockServerFeature: {
			title: "Tests for sap/ui/core/util/Mockserver: given data and complex filter features",
			module: "./MockServerFeature.qunit"
		},
		MockServerAPF: {
			title: "Tests for sap/ui/core/util/MockServer: APF model",
			module: "./MockServerAPF.qunit"
		},
		DraftEnabledMockServer: {
			title: "Tests for sap/ui/core/util/DraftEnabledMockServer",
			module: "./DraftEnabledMockServer.qunit"
		}
	};


	// --- generic part - duplicates tests, once with sinon 1 and once with sinon 4 ---

	var oTestSuite = {
		name: "TestSuite for MockServer",
		tests: {}
	};

	Object.keys(oCommonTests).forEach(function (name) {
		oTestSuite.tests[name + "1"] = merge({}, oCommonTests[name], {
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			}
		});
		if ( oTestSuite.tests[name + "1"].title ) {
			oTestSuite.tests[name + "1"].title = oTestSuite.tests[name + "1"].title + " (Sinon 1)";
		}

		oTestSuite.tests[name + "4"] = merge({}, oCommonTests[name], {
			loader: {
				map: {
					"*": {
						"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
						"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
					}
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		});
		if ( oTestSuite.tests[name + "4"].title ) {
			oTestSuite.tests[name + "4"].title = oTestSuite.tests[name + "4"].title + " (Sinon 4)";
		}
	});

	return oTestSuite;
});
