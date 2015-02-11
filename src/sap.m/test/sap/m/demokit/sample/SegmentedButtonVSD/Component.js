jQuery.sap.declare("sap.m.sample.SegmentedButtonVSD.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.SegmentedButtonVSD.Component", {

	metadata : {
		rootView : "sap.m.sample.SegmentedButtonVSD.V",
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