sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/Configuration"],
	function (UIComponent, Configuration) {
	"use strict";

	// workaround: replacement for data-sap-ui-flexibilityServices = '[{"connector": "LocalStorageConnector"}]' in index.html
	if (!Configuration.getFlexibilityServices().find((oFS) => oFS.connector === "LocalStorageConnector")) {
		Configuration.setFlexibilityServices([{
			connector: "LocalStorageConnector"
		}]);
	}

	return UIComponent.extend("sap.ui.mdc.demokit.sample.TableFilterBarJson");
});