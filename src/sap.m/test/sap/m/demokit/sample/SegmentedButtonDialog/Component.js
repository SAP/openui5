jQuery.sap.declare("sap.m.sample.SegmentedButtonDialog.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SegmentedButtonDialog.Component", {

	metadata : {
		rootView : "sap.m.sample.SegmentedButtonDialog.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js",
					"Dialog.fragment.xml"
				]
			}
		}
	}
});