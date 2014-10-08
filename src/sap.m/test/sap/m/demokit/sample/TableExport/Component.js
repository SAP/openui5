jQuery.sap.declare("sap.m.sample.TableExport.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TableExport.Component", {

	metadata : {
		rootView : "sap.m.sample.TableExport.Table",
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
					"Formatter.js"
				]
			}
		}
	}
});