jQuery.sap.declare("sap.m.sample.Switch.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Switch.Component", {

	metadata : {
		rootView : "sap.m.sample.Switch.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml"
				]
			}
		}
	}
});