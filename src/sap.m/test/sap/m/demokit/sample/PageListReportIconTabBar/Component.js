jQuery.sap.declare("sap.m.sample.PageListReportIconTabBar.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PageListReportIconTabBar.Component", {

	metadata : {
		rootView : "sap.m.sample.PageListReportIconTabBar.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.comp"
			]
		},
		includes : [ "PageListReportIconTabBar/style.css" ],
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