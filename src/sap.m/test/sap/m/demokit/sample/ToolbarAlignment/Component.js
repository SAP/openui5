jQuery.sap.declare("sap.m.sample.ToolbarAlignment.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ToolbarAlignment.Component", {

	metadata : {
		rootView : "sap.m.sample.ToolbarAlignment.Toolbar",
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