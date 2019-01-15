sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit TestSuite for sap.ui.integration",
		defaults: {
			qunit: {
				version: "edge"
			},
			sinon: {
				version: "edge"
			},
			ui5: {
				libs: ["sap.f", "sap.m"],	// Libraries to load upfront in addition to the library which is tested, if null no libs are loaded
				noConflict: true,
				preload: "auto"
			},
			coverage: {
				only: ["sap/ui/integration"]
			},
			autostart: true
		},
		tests: {
			"Card": {
				coverage: {
					only: [
						"sap/ui/integration/widgets/Card",
						"sap/ui/integration/util/CardManifest"
					]
				}
			},
			"util/CustomElements": {
				coverage: {
					only: [
						"sap/ui/integration/util/CustomElements"
					]
				}
			}
		}
	};
});