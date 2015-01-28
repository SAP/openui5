jQuery.sap.declare("sap.m.sample.FlexBoxSizeAdjustments.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBoxSizeAdjustments.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBoxSizeAdjustments.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		includes : [ "FlexBoxSizeAdjustments/style.css" ],
		config : {
			sample : {
				files : [
					"V.view.xml"
				]
			}
		}
	}
});