sap.ui.define(function () {

	"use strict";
	return {
		name: "Demo Apps and Tutorials in sap.ui.documentation",
		defaults: {
			qunit: {
				version: 2
			}
		},

		tests: {
			// demo apps formatters
			"test-resources/sap/ui/documentation/sdk/qunit/demoapps/unit/unitTests": {
				group: "Demo Apps",
				page: "test-resources/sap/ui/documentation/sdk/qunit/demoapps/unit/unitTests.qunit.html"
			},
			// demo apps cells and download
			"test-resources/sap/ui/documentation/sdk/qunit/demoapps/integration/opaTests": {
				group: "Demo Apps",
				page: "test-resources/sap/ui/documentation/sdk/qunit/demoapps/integration/opaTests.qunit.html"
			}
		}
	};
});
