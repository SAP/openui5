jQuery.sap.declare("sap.m.sample.RatingIndicator.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.RatingIndicator.Component", {

	metadata : {
		rootView : "sap.m.sample.RatingIndicator.V",
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