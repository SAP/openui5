sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.troubleshooting.01.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/Component.js",
							"webapp/controller/App.controller.js",
							"webapp/css/style.css",
							"webapp/i18n/i18n.properties",
							"webapp/index.html",
							"webapp/manifest.json",
							"webapp/model/models.js",
							"webapp/view/App.view.xml",
							"ui5.yaml",
							"package.json"
						]
					}
				}
			}
		});

		return Component;
	});
