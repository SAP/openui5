sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.core.tutorial.databinding.15.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/controller/App.controller.js",
							"webapp/i18n/i18n.properties",
							"webapp/i18n/i18n_de.properties",
							"webapp/model/Products.json",
							"webapp/view/App.view.xml",
							"webapp/index.html"
						]
					}
				}
			}

		});

		return Component;

	});
