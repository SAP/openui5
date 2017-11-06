sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TitleToolBar.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.TitleToolBar.Toolbar",
				"type": "XML",
				"async": true
			},
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
