sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.testing.15.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/test/unit/unitTests.qunit.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/controller/BaseController.js",
							"webapp/controller/Post.controller.js",
							"webapp/controller/Worklist.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/localService/mockdata/Posts.json",
							"webapp/localService/metadata.xml",
							"webapp/localService/mockserver.js",
							"webapp/model/DateFormatter.js",
							"webapp/model/FlaggedType.js",
							"webapp/model/formatter.js",
							"webapp/model/models.js",
							"webapp/test/integration/pages/Browser.js",
							"webapp/test/integration/arrangements/Startup.js",
							"webapp/test/integration/pages/Post.js",
							"webapp/test/integration/pages/Worklist.js",
							"webapp/test/integration/AllJourneys.js",
							"webapp/test/integration/opaTests.qunit.html",
							"webapp/test/integration/opaTests.qunit.js",
							"webapp/test/integration/PostJourney.js",
							"webapp/test/integration/WorklistJourney.js",
							"webapp/test/unit/model/DateFormatter.js",
							"webapp/test/unit/model/FlaggedType.js",
							"webapp/test/unit/model/formatter.js",
							"webapp/test/unit/model/models.js",
							"webapp/test/unit/AllTests.js",
							"webapp/test/unit/unitTests.qunit.html",
							"webapp/test/unit/unitTests.qunit.js",
							"webapp/test.html",
							"webapp/test/mockServer.html",
							"webapp/test/initMockServer.js",
							"webapp/test/testsuite.qunit.html",
							"webapp/test/testsuite.qunit.js",
							"webapp/view/App.view.xml",
							"webapp/view/Post.view.xml",
							"webapp/view/Worklist.view.xml",
							"webapp/Component.js",
							"webapp/manifest.json",
							"ui5.yaml",
							"package.json"
						]
					}
				}
			}

		});

		return Component;

	});
