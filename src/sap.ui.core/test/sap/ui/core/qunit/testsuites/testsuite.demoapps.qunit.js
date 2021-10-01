sap.ui.define(function () {

	"use strict";
	return {
		name: "Demo Apps and Tutorials in sap.ui.core",
		defaults: {
			qunit: {
				version: 2
			}
		},

		tests: {
			// sap.ui.core Tutorials
			"sap/ui/core/demokit/tutorial/odatav4/08/webapp/test/integration/opaTests": {
				group: "ODataV4 Tutorial",
				page: "test-resources/sap/ui/core/demokit/tutorial/odatav4/08/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/ui/core/demokit/tutorial/odatav4/11/webapp/test/integration/opaTests": {
				group: "ODataV4 Tutorial",
				page: "test-resources/sap/ui/core/demokit/tutorial/odatav4/11/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/ui/core/demokit/tutorial/troubleshooting/01/webapp/test/integration/opaTests": {
				group: "Troubleshooting Tutorial",
				page: "test-resources/sap/ui/core/demokit/tutorial/troubleshooting/01/webapp/test/integration/opaTests.qunit.html"
			},
			// sap.ui.core Sample Apps
			"sap/ui/core/demokit/sample/RoutingNestedComponent/test/integration/opaTests": {
				group: "Routing Nested Component Sample App",
				page: "test-resources/sap/ui/core/demokit/sample/RoutingNestedComponent/test/integration/opaTests.qunit.html"
			}
		}
	};
});
