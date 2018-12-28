sap.ui.define(function() {
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
						"sap/ui/integration/widgets/CardManifest"
					]
				}
			}
		}
	};
});