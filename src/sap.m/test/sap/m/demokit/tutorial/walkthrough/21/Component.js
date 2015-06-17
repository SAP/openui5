sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.walkthrough.21.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/controller/HelloDialog.js",
							"webapp/controller/HelloPanel.controller.js",
							"webapp/controller/InvoiceList.controller.js",
							"webapp/css/style.css",
							"webapp/i18n/i18n.properties",
							"webapp/view/App.view.xml",
							"webapp/view/HelloDialog.fragment.xml",
							"webapp/view/HelloPanel.view.xml",
							"webapp/view/InvoiceList.view.xml",
							"webapp/Component.js",
							"webapp/index.html",
							"webapp/Invoices.json",
							"webapp/manifest.json"
						]
					}
				}
			}

		});

		return Component;

	});
