jQuery.sap.declare("sap.m.sample.InputValueUpdate.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputValueUpdate.Component", {

	metadata : {
		rootView : "sap.m.sample.InputValueUpdate.V",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}
});
