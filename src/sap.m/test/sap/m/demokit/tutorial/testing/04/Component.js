sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.testing.04.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/test/integration/opaTests.qunit.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/controller/BaseController.js",
							"webapp/controller/ErrorHandler.js",
							"webapp/controller/Worklist.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/model/formatter.js",
							"webapp/model/models.js",
							"webapp/model/promise.js",
							"webapp/view/App.view.xml",
							"webapp/view/Worklist.view.xml",
							"webapp/Component.js",
							"webapp/manifest.json",
							"webapp/test/test.html",
							"webapp/test/testService.html",
							"webapp/test/integration/pages/Common.js",
							"webapp/test/integration/pages/Worklist.js",
							"webapp/test/integration/AllJourneys.js",
							"webapp/test/integration/opaTests.qunit.html",
							"webapp/test/integration/WorklistJourney.js",
							"webapp/test/service/metadata.xml",
							"webapp/test/service/Posts.json",
							"webapp/test/service/server.js",
							"webapp/test/unit/model/formatter.js",
							"webapp/test/unit/model/models.js",
							"webapp/test/unit/allTests.js",
							"webapp/test/unit/unitTests.qunit.html"
						]
					}
				}
			}

		});

		return Component;

	});
