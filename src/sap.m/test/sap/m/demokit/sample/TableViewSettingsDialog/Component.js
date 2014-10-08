jQuery.sap.declare("sap.m.sample.TableViewSettingsDialog.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TableViewSettingsDialog.Component", {

	metadata : {
		rootView : "sap.m.sample.TableViewSettingsDialog.V",
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