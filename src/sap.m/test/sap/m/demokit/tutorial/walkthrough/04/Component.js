sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.tutorial.walkthrough.04.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/view/App.view.xml",
							"webapp/index.html",
							"ui5.yaml",
							"package.json"
						]
					}
				}
			}

		});

		return Component;

	});
