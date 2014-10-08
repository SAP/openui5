jQuery.sap.declare("sap.m.sample.TableSelectDialog.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TableSelectDialog.Component", {

	metadata : {
		rootView : "sap.m.sample.TableSelectDialog.V",
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
					"Dialog.fragment.xml",
					"Formatter.js"
				]
			}
		}
	}
});