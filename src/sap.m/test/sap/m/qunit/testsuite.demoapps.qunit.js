sap.ui.define(function () {

	"use strict";
	return {
		name: "Demo Apps and Tutorials in sap.m",
		defaults: {
			qunit: {
				version: 2
			}
		},

		tests: {
			// sap.m Demo Apps
			"sap/m/demokit/cart/webapp/test/integration/opaTestsComponent": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsComponent.qunit.html"
			},
			"sap/m/demokit/cart/webapp/test/integration/opaTestsGherkinIFrame": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsGherkinIFrame.qunit.html"
			},
			"sap/m/demokit/cart/webapp/test/integration/opaTestsGherkinComponent": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsGherkinComponent.qunit.html"
			},
			"sap/m/demokit/cart/webapp/test/integration/opaTestsIFrame": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsIFrame.qunit.html"
			},
			"sap/m/demokit/cart/webapp/test/unit/unitTests": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/unit/unitTests.qunit.html"
			},
			// "sap/m/demokit/iconExplorer/webapp/test/integration/opaTests": {
			// 	group: "IconExplorer",
			// 	page: "test-resources/sap/m/demokit/iconExplorer/webapp/test/integration/opaTests1.qunit.html"
			// },
			"sap/m/demokit/iconExplorer/webapp/test/unit/unitTests": {
				group: "IconExplorer",
				page: "test-resources/sap/m/demokit/iconExplorer/webapp/test/unit/unitTests.qunit.html"
			},
			"sap/m/demokit/orderbrowser/webapp/test/integration/opaTests": {
				group: "OrderBrowser",
				page: "test-resources/sap/m/demokit/orderbrowser/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/m/demokit/orderbrowser/webapp/test/unit/unitTests": {
				group: "OrderBrowser",
				page: "test-resources/sap/m/demokit/orderbrowser/webapp/test/unit/unitTests.qunit.html"
			},

			// sap.m Templates
			"sap/m/demokit/worklist/webapp/test/testsuite": {
				group: "Worklist",
				page: "test-resources/sap/m/demokit/worklist/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/master-detail/webapp/test/integration/opaTests": {
				group: "MasterDetail",
				page: "test-resources/sap/m/demokit/master-detail/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/m/demokit/master-detail/webapp/test/unit/unitTests": {
				group: "MasterDetail",
				page: "test-resources/sap/m/demokit/master-detail/webapp/test/unit/unitTests.qunit.html"
			},
			"sap/m/demokit/basicTemplate/webapp/test/integration/integration/AllJourneys": {
				group: "BasicTemplate",
				page: "test-resources/sap/m/demokit/basicTemplate/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/m/demokit/basicTemplate/webapp/test/unit/AllTests": {
				group: "BasicTemplate",
				page: "test-resources/sap/m/demokit/basicTemplate/webapp/test/unit/unitTests.qunit.html"
			},

			// sap.m Tutorials
			// NOTE: testing tutorial unitTests are failing intentionally in step 2 and 4. opaTests in step 6, 11 and 13
			"sap/m/demokit/tutorial/testing/01/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/01/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/02/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/02/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/bulletinboard/testsuite.qunit&test=integration/opaTests"
			},
			"sap/m/demokit/tutorial/testing/03/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/03/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/04/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/04/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/bulletinboard/testsuite.qunit&test=integration/opaTests"
			},
			"sap/m/demokit/tutorial/testing/05/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/05/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/06/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/06/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/bulletinboard/testsuite.qunit&test=unit/unitTests"
			},
			"sap/m/demokit/tutorial/testing/07/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/07/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/08/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/08/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/09/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/10/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/10/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/11/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/11/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/bulletinboard/testsuite.qunit&test=unit/unitTests"
			},
			"sap/m/demokit/tutorial/testing/12/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/12/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/13/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/13/webapp/test/Test.qunit.html?testsuite=test-resources/sap/ui/demo/bulletinboard/testsuite.qunit&test=unit/unitTests"
			},
			"sap/m/demokit/tutorial/testing/14/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/15/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/15/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/testing/16/webapp/test/testsuite.qunit.html": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/16/webapp/test/testsuite.qunit.html"
			},
			"sap/m/demokit/tutorial/worklist/07/webapp/test/integration/opaTests": {
				group: "Worklist Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/m/demokit/tutorial/worklist/07/webapp/test/unit/unitTests": {
				group: "Worklist Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/unit/unitTests.qunit.html"
			},
			"sap/m/demokit/tutorial/walkthrough/38/webapp/test/integration/opaTests": {
				group: "Walkthrough Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/m/demokit/tutorial/walkthrough/38/webapp/test/unit/unitTests": {
				group: "Walkthrough Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/unit/unitTests.qunit.html"
			}
		}
	};
});
