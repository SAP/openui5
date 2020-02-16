sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for MockServer",
		defaults: {
			sinon: 1 // because MockServer has a hard dependency to sinon v1
		},
		tests: {
			MockServer: {
				title: "Tests for sap/ui/core/util/MockServer",
				ui5: {
					libs: ["sap.ui.commons"]
				}
			},
			MockServerFeature: {
				title: "Tests for sap/ui/core/util/Mockserver: given data and complex filter features"
			},
			MockServerAPF: {
				title: "Tests for sap/ui/core/util/MockServer: APF model"
			},
			DraftEnabledMockServer: {
				title: "Tests for sap/ui/core/util/DraftEnabledMockServer"
			},
			"MockServer (sinon-4)": {
				title: "Tests for sap/ui/core/util/MockServer",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				sinon: 4,
				module: "./MockServer.qunit",
				ui5: {
					libs: ["sap.ui.commons"]
				}
			},
			"MockServerFeature (sinon-4)": {
				title: "Tests for sap/ui/core/util/Mockserver: given data and complex filter features",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				sinon: 4,
				module: "./MockServerFeature.qunit"
			},
			"MockServerAPF (sinon-4)": {
				title: "Tests for sap/ui/core/util/MockServer: APF model",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				sinon: 4,
				module: "./MockServerAPF.qunit"
			},
			"DraftEnabledMockServer (sinon-4)": {
				title: "Tests for sap/ui/core/util/DraftEnabledMockServer",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				sinon: 4,
				module: "./DraftEnabledMockServer.qunit"
			}
		}
	};
});
