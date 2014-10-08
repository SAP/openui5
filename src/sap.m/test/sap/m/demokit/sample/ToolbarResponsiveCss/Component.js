jQuery.sap.declare("sap.m.sample.ToolbarResponsiveCss.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ToolbarResponsiveCss.Component", {

	metadata : {
		rootView : "sap.m.sample.ToolbarResponsiveCss.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml",
					"Page.controller.js",
					"ActionSheet.fragment.xml"
				]
			}
		}
	}
});