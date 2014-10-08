jQuery.sap.declare("sap.m.sample.ToolbarResponsive.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ToolbarResponsive.Component", {

	metadata : {
		rootView : "sap.m.sample.ToolbarResponsive.Page",
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