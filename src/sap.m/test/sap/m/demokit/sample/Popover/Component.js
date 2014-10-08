jQuery.sap.declare("sap.m.sample.Popover.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Popover.Component", {

	metadata : {
		rootView : "sap.m.sample.Popover.V",
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
					"Popover.fragment.xml"
				]
			}
		}
	}
});