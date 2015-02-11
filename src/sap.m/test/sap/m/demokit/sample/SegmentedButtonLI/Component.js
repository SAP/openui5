jQuery.sap.declare("sap.m.sample.SegmentedButtonLI.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SegmentedButtonLI.Component", {

	metadata : {
		rootView : "sap.m.sample.SegmentedButtonLI.List",
		dependencies : {
			libs : [
				"sap.m"				
			]
		},
		config : {
			sample : {
				files : [
					"List.view.xml"
				]
			}
		}
	}
});