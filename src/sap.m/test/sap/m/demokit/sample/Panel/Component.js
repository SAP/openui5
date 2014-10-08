jQuery.sap.declare("sap.m.sample.Panel.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Panel.Component", {

	metadata : {
		rootView : "sap.m.sample.Panel.Panel",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Panel.view.xml"
				]
			}
		}
	}
});