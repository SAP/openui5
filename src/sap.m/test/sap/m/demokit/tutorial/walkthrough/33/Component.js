sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.walkthrough.33.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/test/testService.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/controller/Detail.controller.js",
							"webapp/controller/HelloDialog.js",
							"webapp/controller/HelloPanel.controller.js",
							"webapp/controller/InvoiceList.controller.js",
							"webapp/css/style.css",
							"webapp/i18n/i18n.properties",
							"webapp/model/formatter.js",
							"webapp/view/App.view.xml",
							"webapp/view/Detail.view.xml",
							"webapp/view/HelloDialog.fragment.xml",
							"webapp/view/HelloPanel.view.xml",
							"webapp/view/InvoiceList.view.xml",
							"webapp/view/Overview.view.xml",
							"webapp/Component.js",
							"webapp/index.html",
							"webapp/manifest.json",
							"webapp/test/testService.html",
							"webapp/test/integration/pages/App.js",
							"webapp/test/integration/navigationJourney.js",
							"webapp/test/integration/opaTests.qunit.html",
							"webapp/test/service/Invoices.json",
							"webapp/test/service/metadata.xml",
							"webapp/test/service/server.js",
							"webapp/test/unit/model/formatter.js",
							"webapp/test/unit/unitTests.qunit.html"
						]
					}
				}
			}

		});

		return Component;

	});
