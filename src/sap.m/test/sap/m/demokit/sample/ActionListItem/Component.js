jQuery.sap.declare("sap.m.sample.ActionListItem.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ActionListItem.Component", {

	metadata : {
		rootView : "sap.m.sample.ActionListItem.List",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"List.view.xml"
				]
			}
		}
	}
});