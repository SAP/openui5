jQuery.sap.declare("sap.m.sample.ToolbarEnabled.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ToolbarEnabled.Component", {

	metadata : {
		rootView : "sap.m.sample.ToolbarEnabled.Toolbar",
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