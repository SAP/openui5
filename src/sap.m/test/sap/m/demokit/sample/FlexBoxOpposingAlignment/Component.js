jQuery.sap.declare("sap.m.sample.FlexBoxOpposingAlignment.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBoxOpposingAlignment.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBoxOpposingAlignment.V",
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