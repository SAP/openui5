jQuery.sap.declare("sap.m.sample.PopoverNavCon.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PopoverNavCon.Component", {

	metadata : {
		rootView : "sap.m.sample.PopoverNavCon.V",
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