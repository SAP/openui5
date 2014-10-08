jQuery.sap.declare("sap.m.sample.IconTabBar.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.IconTabBar.Component", {

	metadata : {
		rootView : "sap.m.sample.IconTabBar.IconTabBar",
		dependencies : {
			libs : [
				"sap.m"
			],
			components : [
				"sap.m.sample.Table"
			]
		},
		config : {
			sample : {
				files : [
					"IconTabBar.view.xml",
					"IconTabBar.controller.js"
				]
			}
		}
	}
});