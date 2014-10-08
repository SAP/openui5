jQuery.sap.declare("sap.m.sample.IconTabBarProcess.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.IconTabBarProcess.Component", {

	metadata : {
		rootView : "sap.m.sample.IconTabBarProcess.IconTabBar",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
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