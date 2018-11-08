sap.ui.define(function () {

	"use strict";
	return {
		name: "sap.m Demo Apps and Samples",
		defaults: {
			page: "test-resources/sap/m/qunit/testsuites/testsuite.demokit.sandbox.html?test={name}",
			qunit: {
				version: 2
			}
		},

		tests: {
			/*
			  * Load test directly using test runner
			  * Prerequisite - rename test files: FILENAME.js to FILENAME.qunit.js)
				"../../demokit/basicTemplate/webapp/test/unit/controller/App.controller": {
				group: "BasicTemplate",
				ui5: {
					resourceroots: {
						"sap/ui/demo/basicTemplate": "test-resources/sap/m/demokit/basicTemplate/webapp"
					}
				}
			},
			"../../demokit/basicTemplate/webapp/test/unit/model/formatter": {
				group: "BasicTemplate",
				ui5: {
					resourceroots: {
						"sap/ui/demo/basicTemplate": "test-resources/sap/m/demokit/basicTemplate/webapp"
					}
				}
			}*/
			// sap.m Demo Apps
			"test-resources/sap/m/demokit/basicTemplate/webapp/test/integration/integration/AllJourneys": {
				group: "BasicTemplate",
				page: "test-resources/sap/m/demokit/basicTemplate/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/basicTemplate/webapp/test/unit/AllTests": {
				group: "BasicTemplate",
				page: "test-resources/sap/m/demokit/basicTemplate/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithComponent": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithComponent.qunit.html"
			},
			"test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithGherkin": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithGherkin.qunit.html"
			},
			"test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithGherkinAndComponent": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithGherkinAndComponent.qunit.html"
			},
			"test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithIFrame": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithIFrame.qunit.html"
			},
			"test-resources/sap/m/demokit/cart/webapp/test/unit/unitTests": {
				group: "ShoppingCart",
				page: "test-resources/sap/m/demokit/cart/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/iconExplorer/webapp/test/integration/opaTests": {
				group: "IconExplorer",
				page: "test-resources/sap/m/demokit/iconExplorer/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/iconExplorer/webapp/test/unit/unitTests": {
				group: "IconExplorer",
				page: "test-resources/sap/m/demokit/iconExplorer/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/orderbrowser/webapp/test/integration/opaTests": {
				group: "OrderBrowser",
				page: "test-resources/sap/m/demokit/orderbrowser/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/orderbrowser/webapp/test/unit/unitTests": {
				group: "OrderBrowser",
				page: "test-resources/sap/m/demokit/orderbrowser/webapp/test/unit/unitTests.qunit.html"
			},

			// sap.m Templates
			"test-resources/sap/m/demokit/master-detail/webapp/test/integration/opaTests": {
				group: "MasterDetail",
				page: "test-resources/sap/m/demokit/master-detail/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/master-detail/webapp/test/unit/unitTests": {
				group: "MasterDetail",
				page: "test-resources/sap/m/demokit/master-detail/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/worklist/webapp/test/integration/opaTests": {
				group: "Worklist",
				page: "test-resources/sap/m/demokit/worklist/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/worklist/webapp/test/unit/unitTests": {
				group: "Worklist",
				page: "test-resources/sap/m/demokit/worklist/webapp/test/unit/unitTests.qunit.html"
			},

			// sap.m Tutorials
			"test-resources/sap/m/demokit/tutorial/testing/01/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/01/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/01/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/01/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/02/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/02/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/03/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/03/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/03/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/03/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/04/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/04/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/05/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/05/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/05/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/05/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/06/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/06/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/07/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/07/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/07/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/07/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/08/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/08/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/unit/unitTests2": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/10/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/10/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/10/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/10/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/11/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/11/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/12/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/12/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/12/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/12/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/13/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/13/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/15/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/15/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/15/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/15/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/16/webapp/test/integration/opaTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/16/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/testing/16/webapp/test/unit/unitTests": {
				group: "Testing Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/testing/16/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/integration/opaTests": {
				group: "Worklist Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/unit/unitTests": {
				group: "Worklist Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/unit/unitTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/integration/opaTests": {
				group: "Walkthrough Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/integration/opaTests.qunit.html"
			},
			"test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/unit/unitTests": {
				group: "Walkthrough Tutorial",
				page: "test-resources/sap/m/demokit/tutorial/walkthrough/38/webapp/test/unit/unitTests.qunit.html"
			},

			// sap.ui.core Tutorials
			"sap/ui/core/demokit/tutorial/odatav4/08/webapp/test/integration/opaTests": {
				group: "ODataV4 Tutorial",
				page: "test-resources/sap/ui/core/demokit/tutorial/odatav4/08/webapp/test/integration/opaTests.qunit.html"
			},
			"sap/ui/core/demokit/tutorial/troubleshooting/01/webapp/test/integration/opaTests": {
				group: "Troubleshooting Tutorial",
				page: "test-resources/sap/ui/core/demokit/tutorial/troubleshooting/01/webapp/test/integration/opaTests.qunit.html"
			}
		}
	};
});
