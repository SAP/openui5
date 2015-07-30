sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.PageListReportToolbar.Component", {

		metadata : {
			rootView : "sap.m.sample.PageListReportToolbar.Page",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.comp"
				]
			},
			includes : [ "PageListReportToolbar/style.css" ],
			config : {
				sample : {
					stretch : true,
					files : [
						"style.css",
						"Page.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
