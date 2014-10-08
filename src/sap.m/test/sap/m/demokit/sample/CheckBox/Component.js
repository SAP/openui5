jQuery.sap.declare("sap.m.sample.CheckBox.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.CheckBox.Component", {

	metadata : {
		rootView : "sap.m.sample.CheckBox.CheckBoxGroup",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"CheckBoxGroup.view.xml"
				]
			}
		}
	}
});