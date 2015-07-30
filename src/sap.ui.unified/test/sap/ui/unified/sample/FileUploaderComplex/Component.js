sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.FileUploaderComplex.Component", {

		metadata : {
			rootView : "sap.ui.unified.sample.FileUploaderComplex.View",
			dependencies : {
				libs : [
					"sap.ui.unified"
				]
			},
			includes : [
			           	"style.css"
			          ],
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
