sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.PageListReportIconTabBar.Component", {

		metadata : {
			rootView : "sap.m.sample.PageListReportIconTabBar.Page",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.comp"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Page.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
