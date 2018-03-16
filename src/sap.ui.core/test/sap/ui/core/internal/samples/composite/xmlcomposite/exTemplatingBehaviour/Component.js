sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
	"use strict";
	return UIComponent.extend("sap.ui.core.internal.samples.composite.xmlcomposite.exTemplatingBehaviour.Component",
		{
			metadata:
			{
				rootView: "sap.ui.core.internal.samples.composite.xmlcomposite.exTemplatingBehaviour.Test"
			},
			init: function () {
				jQuery.sap.require("sap.ui.core.XMLComposite");
				sap.ui.core.util.XMLPreprocessor.plugIn(function (oNode, oVisitor) {
					sap.ui.core.XMLComposite.initialTemplating(oNode, oVisitor, "sap.ui.core.internal.samples.composite.xmlcomposite.exTemplatingBehaviour.comp.field");
				}, "sap.ui.core.internal.samples.composite.xmlcomposite.exTemplatingBehaviour.comp", "field");


sap.ui.Device.system.desktop = "x";
sap.ui.Device.system.tablet = "";

				var oDeviceModel = new JSONModel(sap.ui.Device.system);
				// oDeviceModel.setProperty("/desktop", "x");
				// oDeviceModel.setProperty("/tablet", "y");
				// oDeviceModel.setProperty("/phone", "");

				// // boolean DOES NOT WORK !!
				// oDeviceModel.setProperty("/desktop", true);
				// oDeviceModel.setProperty("/tablet", false);

				var oViewSettings = {
					async: true,
					viewName: "sap.ui.core.internal.samples.composite.xmlcomposite.exTemplatingBehaviour.Test",
					// models: {
					// 	deviceModel: oDeviceModel
					// },
					preprocessors:
					{
						xml:
						{
							models:
							{
								deviceModel: oDeviceModel
							}
						}
					}
				};

				sap.ui.xmlview(oViewSettings).placeAt("content");

				// set data model
				var oData = {
					text: "Hello",
					value: "World"
				};
				var oModel = new JSONModel(oData);
				this.setModel(oModel);

			}

		});
});
