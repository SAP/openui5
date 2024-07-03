sap.ui.define(["sap/ui/Device"], function (Device) {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/UTILS/REFLECTION",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: false,
				useFakeTimers: false
			},
			coverage: {
				only: "[sap/ui/core/util/reflection]"
			},
			loader: {
				paths: {
					"testdata": "test-resources/sap/ui/core/qunit/util/reflection/testdata"
				}
			}
		},
		tests: {
			BaseTreeModifier: {},
			JsControlTreeModifier: {},
			XmlTreeModifier: {}
		}
	};
});