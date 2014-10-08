jQuery.sap.declare("sap.m.sample.InputAssistedTwoValues.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputAssistedTwoValues.Component", {

	metadata : {
		rootView : "sap.m.sample.InputAssistedTwoValues.V",
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js",
					"Dialog.fragment.xml"
				],
				description : "This example shows how to easily implement an assisted input with two-value suggestions"
			}
		}
	}
});