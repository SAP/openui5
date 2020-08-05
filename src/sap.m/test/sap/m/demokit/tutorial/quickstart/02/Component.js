sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.quickstart.02.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/index.html",
							"webapp/index.js",
							"webapp/App.controller.js",
							"webapp/App.view.xml"
						]
					}
				}
			}

		});

		return Component;

	});
