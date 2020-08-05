sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.databinding.02.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/index.html",
							"webapp/index.js",
							"ui5.yaml",
							"package.json"
						]
					}
				}
			}

		});

		return Component;

	});
