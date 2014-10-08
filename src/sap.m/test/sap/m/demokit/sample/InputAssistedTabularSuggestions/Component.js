jQuery.sap.declare("sap.m.sample.InputAssistedTabularSuggestions.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputAssistedTabularSuggestions.Component", {

	metadata : {
		rootView : "sap.m.sample.InputAssistedTabularSuggestions.V",
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js",
					"Dialog.fragment.xml"
				],
				description : "In this example assisted input is provided with table-like suggestions where several columns can display more details."
			}
		}
	}
});