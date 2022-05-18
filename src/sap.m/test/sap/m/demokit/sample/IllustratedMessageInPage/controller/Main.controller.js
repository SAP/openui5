sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			oIllustratedMessageType = library.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPage.controller.Main", {

			onInit: function () {

				var aIMISizeData = [],
					aIMITypeData = [];

				Object.keys(oIllustratedMessageSize).forEach(function (sKey) {
					aIMISizeData.push({key: oIllustratedMessageSize[sKey], text: sKey});
				});
				Object.keys(oIllustratedMessageType).forEach(function (sKey) {
					aIMITypeData.push({key: oIllustratedMessageType[sKey], text: "IllustratedMessageType." + sKey});
				});

				this.oModel = new JSONModel({
					sizeTypes: aIMISizeData,
					typeTypes: aIMITypeData
				});

				this.oModel.setProperty("/sSelectedSize", aIMISizeData[0].key);
				this.oModel.setProperty("/sSelectedEVS", this.getView().byId("im").getEnableVerticalResponsiveness());
				this.oModel.setProperty("/sSelectedType", aIMITypeData[0].key);

				this.getView().setModel(this.oModel);
			},
			onSelectSize: function (oEvent) {
				this.oModel.setProperty("/sSelectedSize", oEvent.getParameter("selectedItem").getKey());
			},
			onSelectType: function (oEvent) {
				this.oModel.setProperty("/sSelectedType", oEvent.getParameter("selectedItem").getKey());
			},
			onSwitchEVS: function (oEvent) {
				this.oModel.setProperty("/sSelectedEVS", oEvent.getParameter("state"));
			}
		});

	});
