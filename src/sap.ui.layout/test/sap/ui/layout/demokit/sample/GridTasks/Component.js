jQuery.sap.declare("sap.ui.layout.sample.GridTasks.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.GridTasks.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.GridTasks.Grid",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Grid.view.xml"
				]
			}
		}
	}
});