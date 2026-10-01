sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit TestSuite for sap.ui.geomap",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.ui.core,sap.ui.geomap",
				noConflict: true
			},
			qunit: {
				version: 2,
				reorder: false
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./{name}.qunit",
			coverage: {
				only: ["sap/ui/geomap/"],
				never: ["test-resources/"]
			}
		},
		tests: {
			ExploredSamples: {
				title: "Test Page for 'Explored' samples from sap.ui.geomap",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					},
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					"xx-componentPreload": "off"
				},
				module: "./ExploredSamples.qunit",
				autostart: false
			},
			Geomap: {
				title: "QUnit Test for Geomap"
			},
			GeomapContainerControl: {
				title: "QUnit Test for GeomapContainerControl"
			},
			GeomapLegendControl: {
				title: "QUnit Test for GeomapLegendControl"
			},
			"testsuite.generic": {
				page: "test-resources/sap/ui/geomap/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});
