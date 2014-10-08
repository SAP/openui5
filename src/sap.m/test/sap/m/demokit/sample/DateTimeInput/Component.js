jQuery.sap.declare("sap.m.sample.DateTimeInput.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.DateTimeInput.Component", {

	metadata : {
		rootView : "sap.m.sample.DateTimeInput.DateTimeInputGroup",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"DateTimeInputGroup.view.xml"
				]
			}
		}
	}
});