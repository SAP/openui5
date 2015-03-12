jQuery.sap.declare("sap.m.sample.TextAreaValueUpdate.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TextAreaValueUpdate.Component", {

	metadata : {
		rootView : "sap.m.sample.TextAreaValueUpdate.V",
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
