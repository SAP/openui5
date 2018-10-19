sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/SAMPLES",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 1 // because MockServer is used by samples
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
