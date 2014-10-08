jQuery.sap.declare("sap.m.sample.TableLayout.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TableLayout.Component", {

	metadata : {
		rootView : "sap.m.sample.TableLayout.Table",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Table.view.xml",
					"Table.controller.js",
					"Dialog.fragment.xml"
				]
			}
		}
	}
});