sap.ui.define(function () {

	"use strict";
	return {
		name: "Demo Apps and Tutorials in sap.tnt",
		defaults: {
			qunit: {
				version: 2
			}
		},

		tests: {
			// sap.tnt demo apps
			"sap/tnt/demokit/toolpageapp/webapp/test/integration/opaTests": {
				group: "Shop Administration Tool",
				page: "test-resources/sap/tnt/demokit/toolpageapp/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/tnt/demokit/toolpageapp/webapp/test/unit/unitTests": {
				group: "Shop Administration Tool",
				page: "test-resources/sap/tnt/demokit/toolpageapp/webapp/test/unit/unitTests.qunit.html"
			}
		}
	};
});
