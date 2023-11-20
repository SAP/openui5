sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
	"use strict";
	return UIComponent.extend("sap.ui.core.internal.samples.composite.xmlcomposite.ex2.Component",
		{
			metadata:
			{
				manifest: "json"
			},
			init: function () {

				// call the init function of the parent
				UIComponent.prototype.init.apply(this, arguments);

				// set data models
				var oDataFloat = {
					value: 46
				};
				this.setModel(new JSONModel(oDataFloat), "floatModel");

				var oDataString = {
					value: "46"
				};
				this.setModel(new JSONModel(oDataString), "stringModel");
			}
		});
});