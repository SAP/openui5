jQuery.sap.declare("sap.m.sample.ActionSheet.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ActionSheet.Component", {

	metadata : {
		rootView : "sap.m.sample.ActionSheet.V",
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
					"ActionSheet.fragment.xml"
				]
			}
		}
	}
});