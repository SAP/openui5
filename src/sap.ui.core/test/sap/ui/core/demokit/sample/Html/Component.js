sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.Html.Component", {

		metadata : {
			rootView : "sap.ui.core.sample.Html.Html",
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
