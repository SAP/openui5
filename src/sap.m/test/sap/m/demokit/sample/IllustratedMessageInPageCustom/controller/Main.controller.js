sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/library"
], function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize;

		return Controller.extend("sap.m.sample.IllustratedMessageInPageCustom.controller.Main", {

			onInit: function () {

				var aIMISizeData = [
					{key: oIllustratedMessageSize[oIllustratedMessageSize.Auto], text: oIllustratedMessageSize.Auto},
					{key: oIllustratedMessageSize[oIllustratedMessageSize.Base], text: oIllustratedMessageSize.Base},
					{key: oIllustratedMessageSize[oIllustratedMessageSize.ExtraSmall], text: oIllustratedMessageSize.ExtraSmall},
					{key: oIllustratedMessageSize[oIllustratedMessageSize.Small], text: oIllustratedMessageSize.Small},
					{key: oIllustratedMessageSize[oIllustratedMessageSize.Medium], text: oIllustratedMessageSize.Medium},
					{key: oIllustratedMessageSize[oIllustratedMessageSize.Large], text: oIllustratedMessageSize.Large}
				];

				this.oModel = new JSONModel({
					sizeTypes: aIMISizeData
				});

				this.oModel.setProperty("/sSelectedSize", aIMISizeData[0].key);

				this.getView().setModel(this.oModel);
			},
			onSelectSize: function (oEvent) {
				this.oModel.setProperty("/sSelectedSize", oEvent.getParameter("selectedItem").getKey());
			}
		});

	});
