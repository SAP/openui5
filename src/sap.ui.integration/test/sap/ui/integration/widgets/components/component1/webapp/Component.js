sap.ui.define([
	"sap/ui/integration/WidgetComponent",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log"
], function(WidgetComponent, JSONModel, Log) {
	"use strict";
	var MyWidgetComponent = WidgetComponent.extend("sap.my.test.widget.component.Component", {
		onWidgetReady: function (oWidget) {
			Log.info("Widget parameters: " + JSON.stringify(oWidget.getCombinedParameters()));
			Log.info("Widget manifest: " + JSON.stringify(oWidget.getManifestEntry("/sap.widget")));

			oWidget.resolveDestination("myDestination").then(function (sUrl) {
				var oModel = new JSONModel(sUrl + "/Products?$format=json&$top=2");
				this.setModel(oModel, "products");
			}.bind(this));
		}
	});
	return MyWidgetComponent;
});
