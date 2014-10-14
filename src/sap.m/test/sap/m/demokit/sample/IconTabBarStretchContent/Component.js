jQuery.sap.declare("sap.m.sample.IconTabBarStretchContent.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.IconTabBarStretchContent.Component", {

	metadata : {
		rootView : "sap.m.sample.IconTabBarStretchContent.IconTabBar",
		dependencies : {
			libs : [
				"sap.m"
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