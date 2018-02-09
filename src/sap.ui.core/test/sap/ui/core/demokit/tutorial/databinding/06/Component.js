sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.databinding.06.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/i18n/i18n.properties",
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
