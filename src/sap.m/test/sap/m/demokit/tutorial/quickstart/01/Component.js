sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.quickstart.01.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/index.html",
							"webapp/index.js"
						]
					}
				}
			}

		});

		return Component;

	});
