sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.worklist.03.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/test/testService.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/controller/BaseController.js",
							"webapp/controller/ErrorHandler.js",
							"webapp/controller/NotFound.controller.js",
							"webapp/controller/Object.controller.js",
							"webapp/controller/Worklist.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/localService/mockdata/Products.json",
							"webapp/localService/mockdata/Suppliers.json",
							"webapp/localService/metadata.xml",
							"webapp/localService/mockserver.js",
							"webapp/model/formatter.js",
							"webapp/model/models.js",
							"webapp/test/integration/pages/App.js",
							"webapp/test/integration/pages/Browser.js",
							"webapp/test/integration/pages/Common.js",
							"webapp/test/integration/pages/NotFound.js",
							"webapp/test/integration/pages/Object.js",
							"webapp/test/integration/pages/shareOptions.js",
							"webapp/test/integration/pages/Worklist.js",
							"webapp/test/integration/AllJourneys.js",
							"webapp/test/integration/NavigationJourney.js",
							"webapp/test/integration/NotFoundJourney.js",
							"webapp/test/integration/ObjectJourney.js",
							"webapp/test/integration/opaTests.qunit.html",
							"webapp/test/integration/WorklistJourney.js",
							"webapp/test/unit/controller/App.controller.js",
							"webapp/test/unit/controller/Worklist.controller.js",
							"webapp/test/unit/helper/FakeI18nModel.js",
							"webapp/test/unit/model/formatter.js",
							"webapp/test/unit/model/models.js",
							"webapp/test/unit/allTests",
							"webapp/test/unit/unitTests.qunit.html",
							"webapp/test/testService.html",
							"webapp/test/testsuite.qunit.html",
							"webapp/view/App.view.xml",
							"webapp/view/NotFound.view.xml",
							"webapp/view/Object.view.xml",
							"webapp/view/ObjectNotFound.view.xml",
							"webapp/view/Worklist.view.xml",
							"webapp/Component.js",
							"webapp/manifest.json",
							"webapp/test.html"
						]
					}
				}
			}

		});

		return Component;

	});
