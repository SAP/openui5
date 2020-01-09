sap.ui.define(function() {

	"use strict";
	return {
		name: "QUnit TestSuite for sap.m",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.m",
				theme: "sap_belize",
				noConflict: true,
				preload: "auto"
			},
			qunit: {
				version: 1,
				reorder: false
			},
			sinon: {
				version: 1,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./{name}.qunit"
		},
		tests: {
			"demokit/basicTemplate/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/basicTemplate/webapp/test/integration/opaTests.qunit.html",
				title: "Integration Tests for Basic Template",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/basicTemplate": "test-resources/sap/m/demokit/basicTemplate/webapp/"
					}
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/basicTemplate/test/integration/AllJourneys"
				]
			},
			"demokit/basicTemplate/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/basicTemplate/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Basic Template",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/basicTemplate": "test-resources/sap/m/demokit/basicTemplate/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/basicTemplate/test/unit/allTests"
				]
			},
			"demokit/cart/webapp/test/integration/opaTestsWithComponent": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithComponent.qunit.html",
				title: "Opa tests for Shopping Cart Journeys with Component",
				ui5: {
					preload: "async",
					language: "en"
				},
				loader: {
					paths: {
						Arrangement: "test-resources/sap/m/demokit/cart/webapp/test/integration/arrangement/component/Arrangement",
						"sap/ui/demo/cart": "test-resources/sap/m/demokit/cart/webapp/"
					}
				},
				group: "Demokit Other Content"
			},
			"demokit/cart/webapp/test/integration/opaTestsWithGherkin": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithGherkin.qunit.html",
				title: "Opa tests for Shopping Cart written in Gherkin",
				ui5: {
					preload: "async",
					language: "en"
				},
				loader: {
					paths: {
						Arrangement: "test-resources/sap/m/demokit/cart/webapp/test/integration/arrangement/iframe/Arrangement",
						"sap/ui/demo/cart": "test-resources/sap/m/demokit/cart/webapp/"
					}
				},
				group: "Demokit Other Content"
			},
			"demokit/cart/webapp/test/integration/opaTestsWithGherkinAndComponent": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithGherkinAndComponent.qunit.html",
				title: "Opa tests for Shopping Cart written in Gherkin using a Component",
				ui5: {
					theme: "sap_bluecrystal",
					preload: "async",
					language: "en"
				},
				loader: {
					paths: {
						Arrangement: "test-resources/sap/m/demokit/cart/webapp/test/integration/arrangement/component/Arrangement",
						"sap/ui/demo/cart": "test-resources/sap/m/demokit/cart/webapp/"
					}
				},
				group: "Demokit Other Content"
			},
			"demokit/cart/webapp/test/integration/opaTestsWithIFrame": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/cart/webapp/test/integration/opaTestsWithIFrame.qunit.html",
				title: "Integration tests for Shopping Cart Journeys with IFrame",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/cart": "test-resources/sap/m/demokit/cart/webapp/",
						Arrangement: "test-resources/sap/m/demokit/cart/webapp/test/integration/arrangement/iframe/Arrangement"
					}
				},
				group: "Demokit Other Content"
			},
			"demokit/cart/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/cart/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Shopping Cart",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/cart": "test-resources/sap/m/demokit/cart/webapp/",
						"sap/ui/demo/mock": "test-resources/sap/m/demokit/ui/documentation/sdk/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/cart/test/unit/allTests"
				]
			},
			"demokit/iconExplorer/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - UIAreas not created per script
				 */
				page: "test-resources/sap/m/demokit/iconExplorer/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Icon Explorer",
				_alternativeTitle: "Opa tests for Worklist",
				ui5: {
					theme: "sap_belize_plus",
					preload: "async",
					language: "en"
				},
				loader: {
					paths: {
						"sap/ui/demo/iconexplorer": "test-resources/sap/m/demokit/iconExplorer/webapp/"
					}
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/iconexplorer/test/integration/AllJourneys"
				]
			},
			"demokit/iconExplorer/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/iconExplorer/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Icon Explorer",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/iconexplorer": "test-resources/sap/m/demokit/iconExplorer/webapp/",
						"test/unit": "test-resources/sap/m/demokit/iconExplorer/webapp/test/unit/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/iconexplorer/test/unit/allTests"
				]
			},
			"demokit/master-detail/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/master-detail/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Master-Detail",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/masterdetail": "test-resources/sap/m/demokit/master-detail/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/masterdetail/test/integration/AllJourneys"
				]
			},
			"demokit/master-detail/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/master-detail/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Master-Detail",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/masterdetail": "test-resources/sap/m/demokit/master-detail/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/masterdetail/test/unit/allTests"
				]
			},
			"demokit/orderbrowser/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/orderbrowser/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Browse Orders",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/orderbrowser": "test-resources/sap/m/demokit/orderbrowser/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content"
			},
			"demokit/orderbrowser/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/orderbrowser/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Browse Orders",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/orderbrowser": "test-resources/sap/m/demokit/orderbrowser/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/orderbrowser/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/01/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/01/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/01/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/01/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/01/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/01/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/02/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/02/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/02/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/03/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/03/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/03/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/03/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/03/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/03/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/04/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/04/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/04/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/05/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/05/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/05/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/05/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/05/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/05/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/06/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/06/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/06/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/07/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/07/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/07/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/07/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/07/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/07/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/08/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/08/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/08/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/09/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/09/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/09/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/09/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/09/webapp/test/unit/unitTests2": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/09/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/09/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/10/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/10/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/10/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/10/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/10/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/10/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/11/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/11/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/11/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/12/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/12/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/12/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/12/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/12/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/12/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/13/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/13/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/13/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/14/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/14/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/14/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/14/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/14/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/15/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/15/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/15/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/15/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/15/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/15/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/testing/16/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/16/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/16/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/testing/16/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/testing/16/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Bulletin Board",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/bulletinboard": "test-resources/sap/m/demokit/tutorial/testing/16/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/demo/bulletinboard/test/unit/allTests"
				]
			},
			"demokit/tutorial/worklist/01/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/01/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/01/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"mycompany/myapp/MyWorklistApp/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/worklist/01/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/01/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/01/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial"
			},
			"demokit/tutorial/worklist/02/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/02/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/02/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"mycompany/myapp/MyWorklistApp/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/worklist/02/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/02/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/02/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial"
			},
			"demokit/tutorial/worklist/03/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/03/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/03/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"mycompany/myapp/MyWorklistApp/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/worklist/03/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/03/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/03/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial"
			},
			"demokit/tutorial/worklist/04/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/04/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/04/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"mycompany/myapp/MyWorklistApp/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/worklist/04/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/04/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/04/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial"
			},
			"demokit/tutorial/worklist/05/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/05/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/05/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"mycompany/myapp/MyWorklistApp/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/worklist/05/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/05/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/05/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial"
			},
			"demokit/tutorial/worklist/06/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/06/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/06/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"mycompany/myapp/MyWorklistApp/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/worklist/06/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/06/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/06/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial"
			},
			"demokit/tutorial/worklist/07/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"mycompany/myapp/MyWorklistApp/test/integration/AllJourneys"
				]
			},
			"demokit/tutorial/worklist/07/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"mycompany/myapp/MyWorklistApp": "test-resources/sap/m/demokit/tutorial/worklist/07/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial"
			},
			"demokit/worklist/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/m/demokit/worklist/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/worklist": "test-resources/sap/m/demokit/worklist/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content",
				module: [
					"sap/ui/demo/worklist/test/integration/AllJourneys"
				]
			},
			"demokit/worklist/webapp/test/unit/unitTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/demokit/worklist/webapp/test/unit/unitTests.qunit.html",
				title: "Unit tests for Worklist",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/demo/worklist": "test-resources/sap/m/demokit/worklist/webapp/",
						"test/unit": "test-resources/sap/m/demokit/worklist/webapp/test/unit/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Other Content"
			},
			ActionListItem: {
				sinon: {
					useFakeTimers: true
				}
			},
			ActionSelect: {
				title: "Test Page for sap.m.ActionSelect",
				_alternativeTitle: "QUnit tests: sap.m.ActionSelect",
				sinon: {
					useFakeTimers: true
				}
			},
			ActionSheet: {
				title: "QUnit Page for sap.m.ActionSheet"
			},
			App: {
				title: "QUnit Page for sap.m.App"
			},
			AppWithBackground: {
				title: "QUnit Page for sap.m.App with Background Images",
				_alternativeTitle: "QUnit Page for sap.m.App"
			},
			Bar: {
				title: "QUnit Page for sap.m.Bar",
				sinon: {
					useFakeTimers: true
				}
			},
			"Bar (RTL)": {
				title: "QUnit Page for sap.m.Bar",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					rtl: true
				},
				module: "./Bar.qunit"
			},
			BarInPageEnabler: {
				title: "QUnit Page for sap.m.BarBase"
			},
			Breadcrumbs: {
				title: "QUnit Page for sap.m.Breadcrumbs",
				sinon: {
					useFakeTimers: true
				}
			},
			BusyDialog: {
				title: "QUnit page for sap.m.BusyDialog",
				sinon: {
					useFakeTimers: true
				}
			},
			BusyIndicator: {
				title: "QUnit page for sap.m.BusyIndicator"
			},
			Button: {
				title: "Test Page for sap.m.Button",
				_alternativeTitle: "QUnit page for sap.m.Button",
				ui5: {
					language: "en"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			CSSClassesFromParameters: {
				/*
				 * Page kept because of
				 *  - Non-trivial DOM content
				 */
				page: "test-resources/sap/m/qunit/CSSClassesFromParameters.qunit.html",
				title: "QUnit Page for Theme-dependent CSS Classes",
				_alternativeTitle: "QUnit tests: CSS Classes for Theme Parameters",
				ui5: {
					theme: "sap_bluecrystal"
				}
			},
			Carousel: {
				title: "Test Page for sap.m.Carousel",
				sinon: {
					useFakeTimers: true
				}
			},
			CheckBox: {
				title: "Test Page for sap.m.CheckBox",
				_alternativeTitle: "QUnit Page for sap.m.CheckBox"
			},
			ColorPalette: {
				title: "ColorPalette - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.ColorPalette",
				ui5: {
					language: "en-US"
				},
				qunit: {
					version: 2
				}
			},
			Column: {
				title: "Column - sap.m",
				sinon: {
					useFakeTimers: true
				}
			},
			ColumnHeader: {
				title: "QUnit Page for sap.m.ColumnHeader",
				coverage: {
					only: "sap/m/ColumnHeader"
				},
				ui5: {
					language: "en"
				}
			},
			ColumnListItem: {
				title: "ColumnListItem - sap.m"
			},
			ColumnMergeDuplicates: {
				title: "QUnit Page for Column Merge Duplicates"
			},
			ComboBox: {
				title: "Test Page for sap.m.ComboBox",
				_alternativeTitle: "QUnit tests: sap.m.ComboBox",
				ui5: {
					libs: "sap.m, sap.ui.layout",
					language: "en"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			CustomTile: {
				title: "QUnit Tests - sap.m.CustomTile"
			},
			CustomTreeItem: {
				title: "QUnit Page for sap.m.CustomTreeItem",
				coverage: {
					branchTracking: true,
					only: "sap/m/CustomTreeItem"
				}
			},
			DatePicker: {
				title: "DatePicker - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DatePicker",
				qunit: {
					// one test checks a module for not being loaded, another checks it for being loaded
					// -> order of tests is significant!
					reorder: false
				},
				ui5: {
					language: "en-US"
				}
			},
			DateRangeSelection: {
				title: "DateRangeSelection - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DateRangeSelection",
				ui5: {
					language: "en-US"
				}
			},
			DateTimeField: {
				title: "DateTimeField - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DatePicker",
				ui5: {
					language: "en-US"
				},
				qunit: {
					version: 2
				}
			},
			DateTimeInput: {
				title: "Test Page for sap.m.DateTimeInput",
				_alternativeTitle: "QUnit page for sap.m.DateTimeInput",
				ui5: {
					language: "en-US"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			DateTimePicker: {
				title: "DatePicker - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DateTimePicker",
				ui5: {
					language: "en-US"
				}
			},
			Dialog: {
				title: "QUnit Page for sap.m.Dialog",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					compatVersion: "1.16"
				}
			},
			DisplayListItem: {
				title: "Test Page for sap.m.DisplayListItem"
			},
			DraftIndicator: {
				title: "Test Page for sap.m.DraftIndicator",
				_alternativeTitle: "QUnit tests: sap.m.DraftIndicator",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1, // as sinon-qunit-bridge doesn't support fake timers yet
					useFakeTimers: true
				}
			},
			ExploredSamples: {
				title: "Test Page for 'Explored' samples from sap.m",
				loader: {
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1 // because MockServer is used by samples
				},
				ui5: {
					libs: "sap.ui.layout,sap.m,sap.ui.documentation",
					"xx-componentPreload": "off"
				},
				autostart: false
			},
			FacetFilter: {
				title: "FacetFilter - sap.m",
				_alternativeTitle: "QUnit Page for sap.m.FacetFilter",
				ui5: {
					language: "en_US"
				}
			},
			FeedContent: {
				title: "Test Page for sap.m.FeedContent",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/FeedContent.*/"
				},
				ui5: {
					libs: "sap.ui.core,sap.m",
					language: "en"
				}
			},
			FeedInput: {
				title: "Test Page for sap.m.FeedInput",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/FeedInput.*/"
				}
			},
			FeedListItem: {
				title: "Test Page for sap.m.FeedListItem",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/FeedListItem.*/"
				}
			},
			FeedListItemAction: {
				title: "QUnit Test Page for sap.m.FeedListItemAction",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				ui5: {
					language: "en"
				}
			},
			Fiori20Adapter: {
				title: "QUnit Page for Fiori20Adapter",
				_alternativeTitle: "QUnit Page for sap.m.Fiori20Adapter"
			},
			FlexBox: {
				title: "QUnit Page for FlexBox - sap.m"
			},
			FlexBoxFitContainerH: {
				title: "QUnit Page for sap.m.FlexBox with FitContainer set and outer HBox",
				_alternativeTitle: "QUnit Page for sap.m.FlexBox with FitContainer set"
			},
			FlexBoxFitContainerV: {
				title: "QUnit Page for sap.m.FlexBox with FitContainer set and outer VBox",
				_alternativeTitle: "QUnit Page for sap.m.FlexBox with FitContainer set"
			},
			FlexBoxFitPage: {
				title: "QUnit Page for sap.m.FlexBox with FitContainer set inside a Page",
				_alternativeTitle: "QUnit Page for sap.m.FlexBox with FitContainer set"
			},
			FormattedText: {
				title: "QUnit test for the sap.m.FormattedText control",
				_alternativeTitle: "QUnit tests: sap.m.FormattedText",
				sinon: {
					useFakeTimers: true
				}
			},
			FormattedTextAnchorGenerator: {
				title: "QUnit test for the sap.m.FormattedTextAnchorGenerator"
			},
			GenericTile: {
				title: "QUnit Test Page for sap.m.GenericTile",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/GenericTile.*/"
				},
				ui5: {
					language: "en"
				}
			},
			GrowingEnablement: {
				title: "QUnit Page for sap.m.GrowingEnablement"
			},
			GrowingList_databinding: {
				title: "QUnit Page for sap.m.GrowingList databinding"
			},
			HBox: {
				title: "QUnit Page for sap.m.HBox"
			},
			HeaderContainer: {
				title: "QUnit: HeaderContainer - sap.m",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/HeaderContainer.*/"
				},
				ui5: {
					libs: "sap.m, sap.ui.layout"
				}
			},
			IconTabBar: {
				title: "QUnit Page for sap.m.IconTabBar",
				sinon: {
					useFakeTimers: true
				}
			},
			Image: {
				title: "Image - sap.m - QUnit test",
				_alternativeTitle: "QUnit Page for sap.m.Image"
			},
			ImageContent: {
				title: "sap.m.ImageContent",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/ImageContent.*/"
				},
				ui5: {
					language: "en"
				}
			},
			Input: {
				title: "QUnit page for sap.m.Input",
				sinon: {
					useFakeTimers: true
				}
			},
			InputBase: {
				title: "QUnit tests: sap.m.InputBase",
				sinon: {
					useFakeTimers: true
				}
			},
			InstanceManager: {
				title: "QUnit Page for sap.m.InstanceManager",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			Ios7: {
				title: "QUnit Page for sap.m.Ios7",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: true
				}
			},
			Label: {
				title: "QUnit page for sap.m.Label"
			},
			LibraryGetScrollDelegate: {
				title: "QUnit test: sap.m.getScrollDelegate",
				loader: {
					paths: {
						"samples/scrollcomp": "test-resources/sap/m/qunit/scrollcomp"
					}
				},
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				ui5: {
					language: "en"
				}
			},
			LightBox: {
				title: "QUnit Page for sap.m.LightBox"
			},
			LightBoxItem: {
				title: "QUnit Page for sap.m.LightBoxItem",
				sinon: {
					useFakeTimers: true
				}
			},
			LightBoxMemoryLeak: {
				title: "QUnit Page for sap.m.LightBox Memory Leaks"
			},
			Link: {
				title: "QUnit page for sap.ui.m.Link"
			},
			List: {
				title: "QUnit Page for sap.m.List and all sap.m List Items",
				coverage: {
					only: "sap/m/List"
				}
			},
			ListBase: {
				title: "Test Page for sap.m.ListBase",
				sinon: {
					useFakeTimers: true
				}
			},
			ListBaseBinding: {
				title: "QUnit Page for sap.m.ListBase Binding"
			},
			MarginCssClasses: {
				title: "QUnit Page for sap.m Margin CSS Classes",
				loader: {
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/m/qunit/test-resources/sap/ui/documentation/sdk/"
					}
				}
			},
			MaskInput: {
				title: "Test Page for sap.m.MaskInput",
				_alternativeTitle: "QUnit page for sap.m.MaskInput",
				ui5: {
					language: "en-US",
					bindingSyntax: "simle"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			MaskInputRule: {
				title: "Test Page for sap.m.MaskInputRule",
				_alternativeTitle: "QUnit page for sap.m.MaskInputRule",
				ui5: {
					language: "en-US"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			Menu: {
				title: "QUnit page for sap.m.Menu",
				ui5: {
					language: "en-US"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			MenuButton: {
				title: "QUnit tests: sap.m.MenuButton",
				sinon: {
					useFakeTimers: true
				}
			},
			MessageBox: {
				title: "QUnit Page for MessageBox",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					compatVersion: "edge"
				}
			},
			MessageItem: {
				title: "QUnit Page for sap.m.MessageItem"
			},
			MessagePage: {
				title: "QUnit Page for sap.m.MessagePage in Responsive mode",
				sinon: {
					useFakeTimers: true
				}
			},
			MessagePopover: {
				title: "QUnit Page for sap.m.MessagePopover",
				sinon: {
					useFakeTimers: true
				}
			},
			MessageStrip: {
				title: "QUnit Page for sap.m.MessageStrip"
			},
			MessageToast: {
				title: "QUnit tests: sap.m.MessageToast"
			},
			MessageView: {
				title: "QUnit Page for sap.m.MessageView",
				sinon: {
					useFakeTimers: true
				}
			},
			MultiComboBox: {
				title: "QUnit tests: sap.m.MultiComboBox",
				sinon: {
					useFakeTimers: true
				}
			},
			MultiEditField: {
				title: "MultiEditField - sap.m - QUnit test",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1, // no fakeTimer support in new sinon-qunit bridge
					useFakeTimers: true
				}
			},
			MultiInput: {
				title: "QUnit page for sap.m.MultiInput",
				sinon: {
					useFakeTimers: true
				}
			},
			NavContainer: {
				title: "QUnit Page for sap.m.NavContainer"
			},
			NewsContent: {
				title: "sap.m.NewsContent",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/NewsContent.*/"
				},
				ui5: {
					language: "en"
				}
			},
			NotificationListBase: {
				title: "QUnit Page for sap.m.NotificationListBase"
			},
			NotificationListGroup: {
				title: "QUnit Page for sap.m.NotificationListGroup"
			},
			NotificationListItem: {
				title: "QUnit Page for sap.m.NotificationListItem",
				sinon: {
					useFakeTimers: true
				}
			},
			NumericContent: {
				title: "Test Page for sap.m.NumericContent",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/NumericContent.*/"
				},
				ui5: {
					libs: "sap.ui.core,sap.m",
					language: "en"
				}
			},
			ObjectAttribute: {
				title: "ObjectAttribute - sap.m"
			},
			ObjectHeader: {
				title: "ObjectHeader - sap.m",
				ui5: {
					theme: "sap_bluecrystal"
				}
			},
			ObjectHeaderResponsive: {
				title: "QUnit Page for sap.m.ObjectHeader in Responsive mode",
				_alternativeTitle: "QUnit Page for sap.m.ObjectHeader responsive behaviour"
			},
			ObjectIdentifier: {
				title: "ObjectIdentifier - sap.m",
				_alternativeTitle: "QUnit Page for sap.m.ObjectIdentifier",
				sinon: {
					useFakeTimers: true
				}
			},
			ObjectListItem: {
				title: "ObjectListItem - sap.m"
			},
			ObjectMarker: {
				title: "Test Page for sap.m.ObjectMarker",
				_alternativeTitle: "QUnit page for sap.m.ObjectMarker",
				ui5: {
					language: "en-US"
				}
			},
			ObjectNumber: {
				title: "ObjectNumber - sap.m",
				_alternativeTitle: "QUnit Page for sap.m.ObjectNumber"
			},
			ObjectStatus: {
				title: "ObjectStatus - sap.m"
			},
			OverflowToolbar: {
				title: "Test Page for sap.m.OverflowToolbar",
				_alternativeTitle: "QUnit tests: sap.m.OverflowToolbar",
				ui5: {
					libs: "sap.m,sap.ui.unified"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			P13nColumnsPanel: {
				title: "Test Page for sap.m.P13nColumnsPanel",
				_alternativeTitle: "QUnit Page for sap.m.P13nColumnsPanel",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: true
				}
			},
			P13nConditionPanel: {
				title: "Test Page for sap.m.P13nConditionPanel",
				_alternativeTitle: "QUnit Page for sap.m.P13nConditionPanel",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				ui5: {
					language: "en" // one test depends on locale specific date formatting
				}
			},
			P13nDialog: {
				title: "Test Page for sap.m.P13nDialog",
				_alternativeTitle: "QUnit Page for sap.m.P13nDialog",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/"
					}
				},
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			P13nDimMeasurePanel: {
				title: "Test Page for sap.m.P13nDimMeasurePanel",
				_alternativeTitle: "QUnit Page for sap.m.P13nDimMeasurePanel",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: true
				}
			},
			P13nFilterPanel: {
				title: "Test Page for sap.m.P13nFilterPanel",
				_alternativeTitle: "QUnit Page for sap.m.P13nFilterPanel",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			P13nGroupPanel: {
				title: "Test Page for sap.m.P13nGroupPanel",
				_alternativeTitle: "QUnit Page for sap.m.P13nGroupPanel",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			P13nSelectionPanel: {
				title: "Test Page for sap.m.P13nSelectionPanel",
				_alternativeTitle: "QUnit Page for sap.m.P13nSelectionPanel",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: true
				}
			},
			P13nSortPanel: {
				title: "Test Page for sap.m.P13nSortPanel",
				_alternativeTitle: "QUnit Page for sap.m.P13nSortPanel",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			PDFViewer: {
				title: "PdfViewer - sap.m",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/PDF.*/"
				}
			},
			Page: {
				title: "QUnit Page for sap.m.Page"
			},
			Page_part2: {
				title: "Test page for sap.m.Page",
				_alternativeTitle: "QUnit tests for sap.m.Page"
			},
			PagingButton: {
				title: "QUnit Page for sap.m.PagingButton",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			Panel: {
				title: "QUnit page for sap.m.Panel"
			},
			PlanningCalendar: {
				title: "PlanningCalendar - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.PlanningCalendar",
				ui5: {
					libs: "sap.m, sap.ui.unified",
					language: "en_GB"
				}
			},
			PlanningCalendarLegend: {
				title: "PlanningCalendarLegend - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.PlanningCalendarLegend",
				ui5: {
					libs: "sap.m, sap.ui.unified"
				}
			},
			Popover: {
				title: "QUnit Page for sap.m.Popover",
				ui5: {
					theme: "sap_bluecrystal"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			ProgressIndicator: {
				title: "QUnit ProgressIndicator",
				_alternativeTitle: "QUnit page for sap.m.ProgressIndicator"
			},
			PullToRefresh_desktop: {
				title: "Test Page for sap.m.PullToRefresh on Desktop",
				_alternativeTitle: "QUnit tests: sap.m.PullToRefresh on Desktop"
			},
			QUnitCompositesUsingIFrames: {
				/*
				 * Page kept because of
				 *  - unhandled script
				 */
				page: "test-resources/sap/m/qunit/QUnitCompositesUsingIFrames.qunit.html"
			},
			QuickView: {
				title: "QUnit page for sap.m.QuickView",
				sinon: {
					useFakeTimers: true
				}
			},
			QuickViewCard: {
				title: "QUnit page for sap.m.QuickView",
				sinon: {
					useFakeTimers: true
				}
			},
			QuickViewPage: {
				title: "QUnit page for sap.m.QuickView Page",
				sinon: {
					useFakeTimers: true
				}
			},
			RadioButton: {
				title: "RadioButton - sap.m - QUnit test",
				_alternativeTitle: "QUnit Page for sap.m.RadioButton",
				sinon: {
					useFakeTimers: true
				}
			},
			RadioButtonGroup: {
				title: "RadioButton - sap.m - QUnit test",
				_alternativeTitle: "QUnit Page for sap.m.RadioButton",
				ui5: {
					libs: "sap.m, sap.ui.core"
				}
			},
			RangeSlider: {
				title: "QUnit Page for sap.m.RangeSlider",
				qunit: {
					version: 2
				}
			},
			RatingIndicator: {
				title: "Test Page for sap.m.RatingIndicator"
			},
			ResponsivePopover: {
				title: "QUnit Page for sap.m.ResponsivePopover",
				sinon: {
					useFakeTimers: true
				}
			},
			ResponsiveScale: {
				title: "Test page for sap.m.ResponsiveScale",
				_alternativeTitle: "QUnit tests: sap.m.ResponsiveScale"
			},
			Rule: {
				title: "QUnit Page for Support Assistant Rules",
				loader: {
					shim: {
						"test-resources/sap/ui/support/TestHelper": {
							exports: "testRule"
						}
					}
				},
				ui5: {
					libs: "sap.m, sap.ui.support",
					support: "silent"
				},
				module: [
					"./rules/Button.qunit",
					"./rules/Dialog.qunit",
					"./rules/IconTabBar.qunit",
					"./rules/Input.qunit",
					"./rules/ObjectHeader.qunit",
					"./rules/ObjectListItem.qunit",
					"./rules/ObjectMarker.qunit",
					"./rules/ObjectStatus.qunit",
					"./rules/Title.qunit"
				]
			},
			ScrollContainer: {
				title: "QUnit Page for sap.m.ScrollContainer"
			},
			ScrollPosition: {
				title: "QUnit Page for Scroll Positions"
			},
			SearchField: {
				title: "Test Page for sap.m.SearchField",
				_alternativeTitle: "QUnit page for sap.ui.m.SearchField"
			},
			SearchField_suggestions: {
				title: "Test Page for sap.m.SearchField with suggestions",
				_alternativeTitle: "QUnit tests: sap.m.SearchField",
				sinon: {
					useFakeTimers: true
				}
			},
			SegmentedButton: {
				title: "Segmented - sap.m - QUnit test",
				_alternativeTitle: "QUnit Page for sap.m.SegmentedButton",
				sinon: {
					useFakeTimers: true
				}
			},
			Select: {
				title: "Test Page for sap.m.Select",
				_alternativeTitle: "QUnit tests: sap.m.Select",
				sinon: {
					useFakeTimers: true
				}
			},
			SelectDialog: {
				title: "QUnit Page for sap.m.SelectDialog",
				sinon: {
					useFakeTimers: true
				}
			},
			SelectList: {
				title: "Test Page for sap.m.SelectList",
				_alternativeTitle: "QUnit tests: sap.m.SelectList",
				sinon: {
					useFakeTimers: true
				}
			},
			SelectionDetails: {
				title: "Test Page for sap.m.SelectionDetails",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "[sap/m/SelectionDetailsItem.js,sap/m/SelectionDetailsListItemRenderer.js]"
				},
				ui5: {
					language: "en"
				}
			},
			SelectionDetailsItem: {
				title: "QUnit Test Page for sap.m.SelectionDetailsItem",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "[sap/m/SelectionDetailsItem.js,sap/m/SelectionDetailsListItemRenderer.js]"
				},
				ui5: {
					language: "en"
				}
			},
			SelectionDetailsItemLine: {
				title: "QUnit Test Page for sap.m.SelectionDetailsItemLine",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1, // no support for fake timers in new qunit-sinon-bridge
					useFakeTimers: true
				},
				coverage: {
					only: "sap/m/SelectionDetailsItemLine.js"
				},
				ui5: {
					language: "en"
				}
			},
			Shell: {
				title: "QUnit Page for sap.m.Shell",
				ui5: {
					theme: "sap_bluecrystal"
				}
			},
			SlideTile: {
				title: "Test Page for sap.m.SlideTile",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/SlideTile.*/"
				},
				ui5: {
					language: "en"
				}
			},
			Slider: {
				title: "Test page for sap.m.Slider",
				_alternativeTitle: "QUnit tests: sap.m.Slider",
				qunit: {
					version: 2
				},
				sinon: {
					useFakeTimers: true
				}
			},
			SplitApp: {
				title: "QUnit Page for sap.m.SplitApp"
			},
			SplitContainer: {
				title: "QUnit Page for sap.m.SplitContainer"
			},
			StandardTile: {
				title: "StandardTile - sap.m",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			StepInput: {
				title: "QUnit Page for sap.m.StepInput",
				sinon: {
					useFakeTimers: true
				}
			},
			Support: {
				title: "QUnit Page for sap.m.Support",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					compatVersion: "1.16"
				}
			},
			Switch: {
				title: "Test Page for sap.m.Switch",
				_alternativeTitle: "QUnit tests: sap.m.Switch",
				sinon: {
					useFakeTimers: true
				}
			},
			TabContainer: {
				title: "QUnit Page for sap.m.TabContainer",
				ui5: {
					language: "en"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			TabStrip: {
				title: "QUnit Page for sap.m.TabStrip",
				ui5: {
					language: "en-US"
				},
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: true
				}
			},
			TabStripItem: {
				title: "QUnit Page for sap.m.TabStripItem",
				ui5: {
					language: "en-US"
				},
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			Table: {
				title: "QUnit Page for sap.m.Table",
				coverage: {
					only: "sap/m/Table"
				},
				ui5: {
					language: "en"
				}
			},
			TablePersoController: {
				title: "QUnit Page for sap.m.TablePersoController",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			TablePersoControllerMigrationInComponent: {
				title: "QUnit Page for sap.m.TablePersoDialog - Migration in Component",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			TablePersoDialog: {
				title: "QUnit Page for sap.m.TablePersoController",
				_alternativeTitle: "QUnit Page for sap.m.TablePersoDialog",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: true
				}
			},
			TableSelectDialog: {
				title: "QUnit Page for sap.m.TableSelectDialog",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: false // some tests activate it
				}
			},
			Text: {
				title: "QUnit Tests - sap.m.Text"
			},
			TextArea: {
				title: "Test Page for sap.m.TextArea",
				_alternativeTitle: "QUnit page for sap.m.TextArea",
				sinon: {
					useFakeTimers: true
				}
			},
			Tile: {
				title: "QUnit Tests - sap.m.Tile",
				ui5: {
					language: "en-US"
				}
			},
			TileContainer: {
				title: "TileContainer - sap.m"
			},
			TileContent: {
				title: "Test Page for sap.m.TileContent",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/TileContent.*/"
				}
			},
			TimePicker: {
				title: "Test Page for sap.m.TimePicker",
				_alternativeTitle: "QUnit page for sap.m.TimePicker",
				ui5: {
					language: "en-US"
				}
			},
			TimePickerSliders: {
				title: "QUnit page for sap.m.TimePickerSliders"
			},
			TimePicker_Locale_bg_BG: {
				title: "Test Page for sap.m.TimePicker in Locale bg_BG",
				_alternativeTitle: "QUnit page for sap.m.TimePicker in Locale bg_BG",
				ui5: {
					language: "bg_BG"
				}
			},
			Title: {
				title: "QUnit Page for sap.m.Title"
			},
			TitlePropagationSupport: {
				title: "QUnit Page for sap.m.TitlePropagationSupport"
			},
			ToggleButton: {
				title: "Test Page for sap.m.ToggleButton",
				_alternativeTitle: "QUnit Page for ToggleButton"
			},
			Token: {
				title: "Test Page for sap.m.Token",
				_alternativeTitle: "QUnit page for sap.m.Token"
			},
			Tokenizer: {
				title: "Test Page for sap.m.Tokenizer",
				_alternativeTitle: "QUnit page for sap.m.Tokenizer"
			},
			Toolbar: {
				title: "Test Page for sap.m.Toolbar",
				_alternativeTitle: "QUnit tests: sap.m.Toolbar"
			},
			Tree: {
				title: "QUnit Page for sap.m.Tree",
				sinon: {
					useFakeTimers: true
				}
			},
			Treeodata: {
				title: "QUnit Page for sap.m.Tree - odata",
				coverage: {
					branchTracking: true,
					only: "sap/ui/core/util"
				}
			},
			UploadCollection: {
				title: "Test Page for sap.m.UploadCollection",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1
				},
				coverage: {
					only: "[sap/m/UploadCollection.js,sap/m/UploadCollectionParameter.js,sap/m/UploadCollectionToolbarPlaceholder.js,sap/m/UploadCollectionRenderer.js,sap/m/UploadCollectionItem.js]"
				},
				ui5: {
					language: "en"
				},
				module: [
					"./UploadCollection.qunit",
					"./UploadCollectionForPendingUpload.qunit",
					"./UploadCollectionItem.qunit",
					"./UploadCollectionMemoryLeak.qunit",
					"./UploadCollectionOpenFileDialog.qunit",
					"./UploadCollectionToolbar.qunit"
				]
			},
			VBox: {
				title: "QUnit Page for sap.m.VBox"
			},
			ValueCSSColor: {
				title: "Test Page for sap.m.ValueCSSColor",
				ui5: {
					language: "en"
				}
			},
			ValueStateMessage: {
				title: "Test page for sap.m.delegate.ValueStateMessage",
				_alternativeTitle: "QUnit tests for sap.m.delegate.ValueStateMessage",
				sinon: {
					useFakeTimers: true
				}
			},
			ViewSettingsDialog: {
				title: "QUnit Page for sap.m.ViewSettingsDialog"
			},
			ViewSettingsDialogCustomTabs: {
				title: "QUnit Page for sap.m.ViewSettingsDialog"
			},
			ViewSettingsPopover: {
				title: "QUnit Page for sap.m.ViewSettingsPopover",
				ui5: {
					language: "en_US"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			Wizard: {
				title: "QUnit Page for sap.m.Wizard",
				sinon: {
					useFakeTimers: true
				}
			},
			WizardProgressNavigator: {
				title: "QUnit Page for sap.m.WizardProgressNavigator",
				ui5: {
					language: "en"
				}
			},
			WizardStep: {
				title: "QUnit Page for sap.m.WizardStep"
			},
			"changeHandler/AddTableColumn": {
				title: "QUnit - sap.m.changeHandler.AddTableColumn",
				ui5: {
					libs: "sap.m,sap.ui.fl"
				}
			},
			"changeHandler/MoveTableColumns": {
				title: "QUnit - sap.m.changeHandler.MoveTableColumns",
				ui5: {
					libs: "sap.m,sap.ui.fl"
				}
			},
			"colorpalette/test/integration/opaTest": {
				/*
				 * Page kept because of
				 *  - non-trivial inline script
				 *  - Script Include of QUnitUtils
				 */
				page: "test-resources/sap/m/qunit/colorpalette/test/integration/opaTest.qunit.html",
				title: "Opa tests for sap.m.ColorPalettePopover",
				loader: {
					paths: {
						"cp/opa/test/app": "test-resources/sap/m/qunit/colorpalette/",
						"cp/opa/test/env": "test-resources/sap/m/qunit/colorpalette/test/"
					}
				},
				qunit: {
					version: 2
				}
			},
			"designtime/ActionSheet": {
				title: "QUnit Page for sap.m.ActionSheet design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Bar": {
				title: "QUnit Page for sap.m.Bar design time and rta enabling",
				_alternativeTitle: "QUnit Page for sap.m.Bar",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},
			"designtime/Button": {
				title: "QUnit Page for sap.m.Button design time",
				_alternativeTitle: "QUnit Page for sap.m.Button",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime",
				module: [
					"./designtime/Button.qunit",
					"./designtime/ButtonCombine.qunit"
				]
			},
			"designtime/CheckBox": {
				title: "QUnit Page for sap.m.CheckBox design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime",
				module: [
					"test-resources/sap/m/qunit/designtime/RatingIndicator.qunit"
				]
			},
			"designtime/CustomListItem": {
				title: "QUnit Page for sap.m.CustomListItem design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},
			"designtime/CustomTile": {
				title: "QUnit Page for sap.m.CustomTile design time",
				_alternativeTitle: "QUnit Page for sap.m.CustomTile",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				group: "Designtime"
			},
			"designtime/DatePicker": {
				title: "QUnit Page for sap.m.DatePicker design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/FlexBox": {
				title: "QUnit Page for sap.m.FlexBox design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/IconTabBar": {
				title: "QUnit IconTabBar for sap.m.IconTabBar design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},
			"designtime/IconTabFilter": {
				title: "QUnit IconTabFilter for sap.m.IconTabFilter design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},
			"designtime/Image": {
				title: "QUnit Page for sap.m.Image design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/InputBase": {
				title: "QUnit Page for sap.m.InputBase design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/InputListItem": {
				title: "QUnit Page for sap.m.InputListItem design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				group: "Designtime"
			},
			"designtime/Label": {
				title: "QUnit Page for sap.m.Label design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Library": {
				title: "QUnit Page for designtime consistency check of sap.m library",
				group: "Designtime"
			},
			"designtime/Link": {
				title: "QUnit Page for sap.m.Link design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/ListBase": {
				title: "QUnit Page for sap.m.ListBase design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/ListItemBase": {
				title: "QUnit Page for sap.m.ListItemBase design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/MenuButton": {
				title: "QUnit Page for sap.m.MenuButton design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/OverflowToolbarButton": {
				title: "QUnit Page for sap.m.OverflowToolbarButton design time and rta enabling",
				_alternativeTitle: "QUnit Page for sap.m.OverflowToolbarButton rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				qunit: 2,
				sinon: false,
				group: "Designtime"
			},
			"designtime/Page": {
				title: "QUnit Page for sap.m.Page design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},
			"designtime/Panel": {
				title: "QUnit Page for sap.m.Panel design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Popover": {
				title: "QUnit Page for sap.m.Popover design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/RadioButton": {
				title: "QUnit Page for sap.m.RadioButton design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/RatingIndicator": {
				title: "QUnit Page for sap.m.RatingIndicator design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},
			"designtime/ScrollContainer": {
				title: "QUnit Page for sap.m.ScrollContainer design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Select": {
				title: "QUnit Page for sap.m.Select design time",
				_alternativeTitle: "QUnit Page for sap.m.Select",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				group: "Designtime"
			},
			"designtime/Slider": {
				title: "QUnit Page for sap.m.Slider design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/SplitContainer": {
				title: "QUnit Page for sap.m.SplitContainer design time",
				_alternativeTitle: "QUnit Page for sap.m.SplitContainer",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				group: "Designtime"
			},
			"designtime/StandardListItem": {
				title: "QUnit Page for sap.m.StandardListItem design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Table": {
				title: "QUnit Page for sap.m.Table design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Text": {
				title: "QUnit Page for sap.m.Text design time and rta enabling",
				_alternativeTitle: "QUnit Page for sap.m.Text rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Title": {
				title: "QUnit Page for sap.m.Title design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				group: "Designtime"
			},
			"designtime/Toolbar": {
				title: "QUnit Page for sap.m.Toolbar design time and rta enabling",
				_alternativeTitle: "QUnit Page for sap.m.Toolbar",
				ui5: {
					libs: "sap.m,sap.ui.rta"
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},
			"planningcalendar/test/integration/opaTest": {
				/*
				 * Page kept because of
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/qunit/planningcalendar/test/integration/opaTest.qunit.html",
				title: "Opa tests for PlanningCalendar",
				loader: {
					paths: {
						"sap/ui/demo/PlanningCalendar/test": "test-resources/sap/m/qunit/planningcalendar/test/"
					}
				}
			},
			"routing/async/RouteMatchedHandler": {
				title: "QUnit Page for RouteMatchedHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			"routing/async/Router": {
				title: "QUnit Page for sap.m.routing.Router",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			"routing/async/Targets": {
				title: "QUnit Page for sap.m.routing.Targets",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			"routing/common/RouteMatchedHandler": {
				title: "QUnit Page for RouteMatchedHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			"routing/common/TargetHandler": {
				title: "QUnit Page for sap.m.routing.TargetHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			"routing/sync/RouteMatchedHandler": {
				title: "QUnit Page for RouteMatchedHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1,
					useFakeTimers: true
				}
			},
			"routing/sync/Router": {
				title: "QUnit Page for sap.m.routing.Router",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			"routing/sync/Targets": {
				title: "QUnit Page for sap.m.routing.Targets",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				}
			},
			"semantic/Segment": {
				title: "Test Page for sap.m.semantic.Segment",
				_alternativeTitle: "QUnit tests: sap.m.semantic.SemanticPage"
			},
			"semantic/SemanticButton": {
				title: "Test Page for sap.m.semantic.SemanticButton",
				_alternativeTitle: "QUnit tests: sap.m.semantic.SemanticButton",
				sinon: {
					useFakeTimers: true
				}
			},
			"semantic/SemanticPage": {
				title: "Test Page for sap.m.SemanticPage",
				_alternativeTitle: "QUnit tests: sap.m.SemanticPage"
			},
			"semantic/SemanticSelect": {
				title: "Test Page for sap.m.semantic.SemanticSelect",
				_alternativeTitle: "QUnit tests: sap.m.semantic.SemanticSelect"
			},
			"semantic/ShareMenu": {
				title: "Test Page for sap.m.semantic.ShareMenu",
				_alternativeTitle: "QUnit tests: sap.m.semantic.SemanticPage"
			},
			"ui/core/demokit/tutorial/odatav4/08/webapp/test/integration/opaTests": {
				/*
				 * Page kept because of
				 *  - Demokit Content
				 */
				page: "test-resources/sap/ui/core/demokit/tutorial/odatav4/08/webapp/test/integration/opaTests.qunit.html",
				title: "Integration tests for the OData V4 Tutorial",
				ui5: {
					preload: "async"
				},
				loader: {
					paths: {
						"sap/ui/core/tutorial/odatav4": "test-resources/sap/ui/core/demokit/tutorial/odatav4/08/webapp/"
					}
				},
				qunit: {
					version: 2
				},
				group: "Demokit Tutorial",
				module: [
					"sap/ui/core/tutorial/odatav4/test/integration/AllJourneys"
				]
			}
		}
	};
});
