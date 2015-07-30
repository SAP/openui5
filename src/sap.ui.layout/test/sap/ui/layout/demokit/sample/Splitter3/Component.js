sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.Splitter3.Component", {

		metadata : {
			rootView : "sap.ui.layout.sample.Splitter3.Splitter",
			dependencies : {
				libs : [
					"sap.ui.commons",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Splitter.view.xml",
						"Splitter.controller.js"
					]
				}
			}
		},
	
		onAfterRendering : function() {
			this.oContainer.setHeight("100%");
		}
	});

	return Component;

});
