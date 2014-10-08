jQuery.sap.declare("sap.m.sample.ObjectHeaderTitleActive.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderTitleActive.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderTitleActive.V",
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