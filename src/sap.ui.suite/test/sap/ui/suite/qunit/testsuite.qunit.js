sap.ui.define(function() {

	"use strict";
	return {
		name: "QUnit TestSuite for sap.ui.table",
		defaults: {
			title: "Test Page for {name} - sap.ui.suite",
			bootCore: true,
			ui5: {
				libs: "sap.ui.suite",
				theme: "sap_belize",
				noConflict: true,
				preload: "auto"
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
			module: "./{name}.qunit"
		},
		tests: {
			TaskCircle: {},
			VerticalProgressIndicator: {}
		}
	};
});
