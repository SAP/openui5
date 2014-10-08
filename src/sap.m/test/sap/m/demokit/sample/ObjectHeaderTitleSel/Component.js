jQuery.sap.declare("sap.m.sample.ObjectHeaderTitleSel.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderTitleSel.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderTitleSel.V",
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