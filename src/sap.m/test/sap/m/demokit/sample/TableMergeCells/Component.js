jQuery.sap.declare("sap.m.sample.TableMergeCells.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TableMergeCells.Component", {

	metadata : {
		rootView : "sap.m.sample.TableMergeCells.Table",
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