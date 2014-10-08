jQuery.sap.declare("sap.m.sample.ResponsivePopover.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ResponsivePopover.Component", {

	metadata : {
		rootView : "sap.m.sample.ResponsivePopover.V",
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