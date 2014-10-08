jQuery.sap.declare("sap.m.sample.TableOutdated.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TableOutdated.Component", {

	metadata : {
		rootView : "sap.m.sample.TableOutdated.Table",
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
					"Table.controller.js"
				]
			}
		}
	}
});