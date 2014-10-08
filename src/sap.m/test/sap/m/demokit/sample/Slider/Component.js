jQuery.sap.declare("sap.m.sample.Slider.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Slider.Component", {

	metadata : {
		rootView : "sap.m.sample.Slider.V",
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