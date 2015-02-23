sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.wt.Component", {

		metadata : {
			name : "Hello World",
			rootView : "sap.ui.demo.wt.view.App",
			dependencies : {
				libs : [ "sap.m" ]
			}
		},

		init : function () {

			// call the overridden init function
			UIComponent.prototype.init.apply(this, arguments);

			// set data model
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oDataModel = new JSONModel(oData);
			this.setModel(oDataModel);

			// set i18n model
			var i18nModel = new ResourceModel({
				bundleName : "sap.ui.demo.wt.i18n.messageBundle"
			});
			this.setModel(i18nModel, "i18n");
		}
	});

}, /* bExport= */ true);
