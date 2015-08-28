sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.testing.02.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/test/unit/unitTests.qunit.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/controller/BaseController.js",
							"webapp/controller/Worklist.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/localService/mockdata/Posts.json",
							"webapp/localService/metadata.xml",
							"webapp/localService/mockserver.js",
							"webapp/model/formatter.js",
							"webapp/model/models.js",
							"webapp/test/integration/pages/Common.js",
							"webapp/test/integration/pages/Worklist.js",
							"webapp/test/integration/AllJourneys.js",
							"webapp/test/integration/opaTests.qunit.html",
							"webapp/test/integration/WorklistJourney.js",
							"webapp/test/unit/model/formatter.js",
							"webapp/test/unit/model/models.js",
							"webapp/test/unit/allTests.js",
							"webapp/test/unit/unitTests.qunit.html",
							"webapp/test/test.html",
							"webapp/test/testService.html",
							"webapp/view/App.view.xml",
							"webapp/view/Worklist.view.xml",
							"webapp/Component.js",
							"webapp/manifest.json"
						]
					}
				}
			}

		});

		return Component;

	});
