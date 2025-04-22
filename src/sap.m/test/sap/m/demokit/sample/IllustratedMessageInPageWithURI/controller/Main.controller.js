sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library', 'sap/tnt/library'],
	function (JSONModel, Controller, mLibrary, tntLibrary) {
		"use strict";

		var oIllustratedMessageSize = mLibrary.IllustratedMessageSize,
			oMIllustratedMessageType = mLibrary.IllustratedMessageType,
			oTNTIllustratedMessageType = tntLibrary.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPageWithURI.controller.Main", {

			onInit: function () {

				var aIMISizeData = [
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Auto], text: oIllustratedMessageSize.Auto},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Base], text: oIllustratedMessageSize.Base},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.ExtraSmall], text: oIllustratedMessageSize.ExtraSmall},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Small], text: oIllustratedMessageSize.Small},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Medium], text: oIllustratedMessageSize.Medium},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Large], text: oIllustratedMessageSize.Large}
					],
					aIMITypeData = [];

				Object.keys(oMIllustratedMessageType).forEach((key) => {
					const val = `sap-illustration://${oMIllustratedMessageType[key].split('-')[1]}`;
					aIMITypeData.push({ key: val, text: val });
				});

				Object.keys(oTNTIllustratedMessageType).forEach((key) => {
					const val = `sap-illustration://tnt/${oTNTIllustratedMessageType[key].split('-')[1]}`;
					aIMITypeData.push({ key: val, text: val });
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
