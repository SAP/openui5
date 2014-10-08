jQuery.sap.declare("sap.m.sample.ObjectStatus.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectStatus.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectStatus.V",
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