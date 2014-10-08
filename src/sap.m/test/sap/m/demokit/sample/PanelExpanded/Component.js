jQuery.sap.declare("sap.m.sample.PanelExpanded.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PanelExpanded.Component", {

	metadata : {
		rootView : "sap.m.sample.PanelExpanded.PanelExpanded",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"PanelExpanded.view.xml"
				]
			}
		}
	}
});