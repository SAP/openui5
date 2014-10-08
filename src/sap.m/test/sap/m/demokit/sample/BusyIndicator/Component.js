jQuery.sap.declare("sap.m.sample.BusyIndicator.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.BusyIndicator.Component", {

	metadata : {
		rootView : "sap.m.sample.BusyIndicator.V",
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
					"V.view.xml"
				]
			}
		}
	}
});