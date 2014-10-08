jQuery.sap.declare("sap.m.sample.IconTabBarMulti.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.IconTabBarMulti.Component", {

	metadata : {
		rootView : "sap.m.sample.IconTabBarMulti.IconTabBar",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"IconTabBar.view.xml"
				]
			}
		}
	}
});