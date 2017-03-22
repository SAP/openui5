sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.PageListReportToolbar.Component", {

		metadata : {
			rootView : "sap.m.sample.PageListReportToolbar.Page",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout",
					"sap.ui.table"
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
