sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.LinkSubtle.Component", {

		metadata : {
			rootView : "sap.m.sample.LinkSubtle.Link",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"Link.view.xml",
						"Link.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
