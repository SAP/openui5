jQuery.sap.declare("sap.m.sample.InputListItem.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputListItem.Component", {

	metadata : {
		rootView : "sap.m.sample.InputListItem.List",
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