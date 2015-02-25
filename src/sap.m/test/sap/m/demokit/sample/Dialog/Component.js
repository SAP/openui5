jQuery.sap.declare("sap.m.sample.Dialog.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Dialog.Component", {

	metadata: {
		rootView: "sap.m.sample.Dialog.V",
		dependencies: {
			libs: [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config: {
			sample: {
				files: [
					"V.view.xml",
					"C.controller.js",
					"MsgDialog.fragment.xml",
					"StdDialog.fragment.xml"
				]
			}
		}
	}
});