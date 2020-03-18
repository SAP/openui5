sap.ui.define(["sap/ui/integration/WidgetComponent", "sap/ui/model/json/JSONModel"], function(WidgetComponent, JSONModel) {
	"use strict";
	var MyWidgetComponent = WidgetComponent.extend("sap.my.test.widget.component.Component", {
		onWidgetReady: function (oWidget) {
			oWidget.resolveDestination("myDestination").then(function (sUrl) {
				var oModel = new JSONModel(sUrl + "/Products?$format=json&$top=2");
				this.setModel(oModel, "products");
			}.bind(this));
		}
	});
	return MyWidgetComponent;
});
