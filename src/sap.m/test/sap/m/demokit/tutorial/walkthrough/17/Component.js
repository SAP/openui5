sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.walkthrough.17.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "src/index.html",
						stretch: true,
						files: [
							"src/controller/App.controller.js",
							"src/controller/HelloPanel.controller.js",
							"src/css/style.css",
							"src/i18n/i18n.properties",
							"src/view/App.view.xml",
							"src/view/HelloDialog.fragment.xml",
							"src/view/HelloPanel.view.xml",
							"src/Component.js",
							"src/index.html",
							"src/manifest.json"
						]
					}
				}
			}

		});

		return Component;

	});
