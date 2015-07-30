sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TitleToolBar.Component", {

		metadata : {
			rootView : "sap.m.sample.TitleToolBar.Toolbar",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Toolbar.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
