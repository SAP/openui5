jQuery.sap.declare("sap.m.sample.Label.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Label.Component", {

	metadata : {
		rootView : "sap.m.sample.Label.LabelGroup",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"LabelGroup.view.xml"
				]
			}
		}
	}
});