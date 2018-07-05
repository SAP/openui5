sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";
	return UIComponent.extend("sap.ui.rta.dttool.Component", {
		metadata : {
			rootView: {
				"viewName": "sap.ui.rta.dttool.view.App",
				"type": "XML",
				"async": true,
				"id": "app"
			},
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});