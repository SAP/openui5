jQuery.sap.declare("sap.m.sample.ToolbarVsBar.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ToolbarVsBar.Component", {

	metadata : {
		rootView : "sap.m.sample.ToolbarVsBar.Page",
		dependencies : {
			libs : [
				"sap.m"
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