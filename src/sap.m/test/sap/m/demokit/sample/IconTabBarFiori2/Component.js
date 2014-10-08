jQuery.sap.declare("sap.m.sample.IconTabBarFiori2.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.IconTabBarFiori2.Component", {

	metadata : {
		rootView : "sap.m.sample.IconTabBarFiori2.IconTabBar",
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