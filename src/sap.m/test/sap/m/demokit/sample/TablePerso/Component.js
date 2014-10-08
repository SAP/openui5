jQuery.sap.declare("sap.m.sample.TablePerso.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TablePerso.Component", {

	metadata : {
		rootView : "sap.m.sample.TablePerso.Table",
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
					"DemoPersoService.js",
					"Formatter.js"
				]
			}
		}
	}
});