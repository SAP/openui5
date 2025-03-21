sap.ui.define(["sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/tnt/IllustratedMessageType", "sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller'],
	function(oIllustratedMessageSize, oMIllustratedMessageType, oTNTIllustratedMessageType, JSONModel, Controller) {
		"use strict";

		return Controller.extend("sap.m.sample.IllustratedMessageInPageWithURI.controller.Main", {

			onInit: function () {

				var aIMISizeData = [],
					aIMITypeData = [];

				Object.keys(oMIllustratedMessageType).forEach((key) => {
					const val = `sap-illustration://${oMIllustratedMessageType[key].split('-')[1]}`;
					aIMITypeData.push({ key: val, text: val });
				});

				Object.keys(oTNTIllustratedMessageType).forEach((key) => {
					const val = `sap-illustration://tnt/${oTNTIllustratedMessageType[key].split('-')[1]}`;
					aIMITypeData.push({ key: val, text: val });
				});

				Object.keys(oIllustratedMessageSize).forEach(function (sKey) {
					aIMISizeData.push({key: oIllustratedMessageSize[sKey], text: sKey});
				});

				this.oModel = new JSONModel({
					sizeTypes: aIMISizeData,
					typeTypes: aIMITypeData
				});

				this.oModel.setProperty("/sSelectedSize", aIMISizeData[0].key);
				this.oModel.setProperty("/sSelectedEVS", this.getView().byId("im").getEnableVerticalResponsiveness());
				this.oModel.setProperty("/sSelectedSRC", aIMITypeData[0].key);

				this.getView().setModel(this.oModel);
			},
			onSelectSize: function (oEvent) {
				this.oModel.setProperty("/sSelectedSize", oEvent.getParameter("selectedItem").getKey());
			},
			onSelectType: function (oEvent) {
				this.oModel.setProperty("/sSelectedSRC", oEvent.getParameter("selectedItem").getKey());
			},
			onSwitchEVS: function (oEvent) {
				this.oModel.setProperty("/sSelectedEVS", oEvent.getParameter("state"));
			}
		});
	});
