sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/fl/initial/_internal/config"],
	function (UIComponent, config) {
	"use strict";

	// workaround: replacement for data-sap-ui-flexibilityServices = '[{"connector": "LocalStorageConnector"}]' in index.html
	if (!config.getFlexibilityServices().find((oFS) => oFS.connector === "LocalStorageConnector")) {
		config.setFlexibilityServices([{
			connector: "LocalStorageConnector"
		}]);
	}

	return UIComponent.extend("sap.ui.mdc.demokit.sample.TableFilterBarJson");
});