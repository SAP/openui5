sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.walkthrough.32.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "src/testService.html",
						stretch: true,
						files: [
							"src/controller/App.controller.js",
							"src/controller/Detail.controller.js",
							"src/controller/HelloDialog.js",
							"src/controller/HelloPanel.controller.js",
							"src/controller/InvoiceList.controller.js",
							"src/css/style.css",
							"src/i18n/i18n.properties",
							"src/model/formatter.js",
							"src/view/App.view.xml",
							"src/view/Detail.view.xml",
							"src/view/HelloDialog.fragment.xml",
							"src/view/HelloPanel.view.xml",
							"src/view/InvoiceList.view.xml",
							"src/view/Overview.view.xml",
							"src/Component.js",
							"src/index.html",
							"src/manifest.json",
							"src/testService.html",
							"test/integration/pages/App.js",
							"test/integration/navigationJourney.js",
							"test/integration/opaTests.qunit.html",
							"test/service/Invoices.json",
							"test/service/metadata.xml",
							"test/service/server.js",
							"test/unit/model/formatter.js",
							"test/unit/unitTests.qunit.html"
						]
					}
				}
			}

		});

		return Component;

	});
