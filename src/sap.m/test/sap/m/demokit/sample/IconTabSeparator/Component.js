jQuery.sap.declare("sap.m.sample.IconTabSeparator.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.IconTabSeparator.Component", {

	metadata : {
		rootView : "sap.m.sample.IconTabSeparator.IconTab",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"IconTab.view.xml"
				]
			}
		}
	}
});