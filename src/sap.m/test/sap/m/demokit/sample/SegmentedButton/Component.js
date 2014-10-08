jQuery.sap.declare("sap.m.sample.SegmentedButton.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SegmentedButton.Component", {

	metadata : {
		rootView : "sap.m.sample.SegmentedButton.Page",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml"
				]
			}
		}
	}
});