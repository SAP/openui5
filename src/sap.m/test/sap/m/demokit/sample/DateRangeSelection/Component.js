jQuery.sap.declare("sap.m.sample.DateRangeSelection.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.DateRangeSelection.Component", {

	metadata : {
		rootView : "sap.m.sample.DateRangeSelection.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout",
				"sap.ui.unified"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}

});