jQuery.sap.declare("sap.m.sample.IconTabBarNoIcons.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.IconTabBarNoIcons.Component", {

	metadata : {
		rootView : "sap.m.sample.IconTabBarNoIcons.IconTabBar",
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