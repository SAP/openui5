jQuery.sap.declare("sap.m.sample.MessagePopover.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessagePopover.Component", {

	metadata : {
		rootView : "sap.m.sample.MessagePopover.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}
});
