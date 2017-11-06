sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.Html.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.core.sample.Html.Html",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Html.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
