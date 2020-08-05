sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/SAMPLES",
		defaults: {
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
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			ExploredSamples: {
				title: "Test Page for 'Explored' samples from sap.ui.core",
				loader: {
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					libs: "sap.ui.layout,sap.m,sap.ui.documentation",
					"xx-componentPreload": "off"
				},
				autostart: false
			}
		}
	};
});
