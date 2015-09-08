sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.navigation.02.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/controller/Home.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/view/App.view.xml",
							"webapp/view/Home.view.xml",
							"webapp/Component.js",
							"webapp/index.html",
							"webapp/manifest.json",
							"webapp/localService/mockdata/Employees.json",
							"webapp/localService/metadata.xml",
							"webapp/localService/mockdata/Resumes.json",
							"webapp/localService/mockserver.js"
						]
					}
				}
			}

		});

		return Component;
	});
