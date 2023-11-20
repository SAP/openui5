// bootstrap configuration for test 'Core.qunit.html'
window["sap-ui-config"] = {
	themeRoots : {
		"my_preconfigured_theme" : "http://preconfig.com/ui5-themes",
		"my_second_preconfigured_theme" : {
			"sap.m" : "http://mobile.preconfig.com/ui5-themes",
			"" : "http://preconfig.com/ui5-themes",
			"sap.ui.core" : "http://core.preconfig.com/ui5-themes"
		}
	}
};
