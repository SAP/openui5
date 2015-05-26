sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.walkthrough.02.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "src/index.html",
						stretch: true,
						files: [
							"src/index.html"
						]
					}
				}
			}

		});

		return Component;

	});
