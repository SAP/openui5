jQuery.sap.declare("sap.m.sample.FlexBoxDirectionOrder.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBoxDirectionOrder.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBoxDirectionOrder.V",
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