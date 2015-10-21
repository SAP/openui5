sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.mockserver.01.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/test/testService.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/localService/metadata.xml",
							"webapp/test/testService.html",
							"webapp/view/App.view.xml",
							"webapp/Component.js",
							"webapp/manifest.json"
						]
					}
				}
			}

		});

		return Component;

	});