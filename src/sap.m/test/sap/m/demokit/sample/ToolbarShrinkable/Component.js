jQuery.sap.declare("sap.m.sample.ToolbarShrinkable.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ToolbarShrinkable.Component", {

	metadata : {
		rootView : "sap.m.sample.ToolbarShrinkable.Toolbar",
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