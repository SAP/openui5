sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.Currency.Component", {

		metadata : {
			rootView : "sap.ui.unified.sample.Currency.View",
			dependencies : {
				libs : [
					"sap.ui.unified"
				]
			},

			config : {
				sample : {
					files : [
						"View.view.xml",
						"Controller.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
