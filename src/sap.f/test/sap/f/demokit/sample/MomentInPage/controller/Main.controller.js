sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/f/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			oIllustratedMessageType = library.IllustratedMessageType;

		return Controller.extend("sap.f.sample.IllustratedMessageInPage.controller.Main", {

			onInit: function () {

				var aFMISizeData = [],
					aFMITypeData = [];

				Object.keys(oIllustratedMessageSize).forEach(function (sKey) {
					aFMISizeData.push({key: oIllustratedMessageSize[sKey], text: sKey});
				});
				Object.keys(oIllustratedMessageType).forEach(function (sKey) {
					aFMITypeData.push({key: oIllustratedMessageType[sKey], text: "IllustratedMessageType." + sKey});
				});

				aFMITypeData.push({key: "tnt-FaceID", text:"tnt-FaceID"});
				aFMITypeData.push({key: "tnt-Fingerprint", text:"tnt-Fingerprint"});
				aFMITypeData.push({key: "tnt-Lock", text:"tnt-Lock"});
				aFMITypeData.push({key: "tnt-NoApplications", text:"tnt-NoApplications"});
				aFMITypeData.push({key: "tnt-NoFlows", text:"tnt-NoFlows"});
				aFMITypeData.push({key: "tnt-SuccessfulAuth", text:"tnt-SuccessfulAuth"});
				aFMITypeData.push({key: "tnt-Unlock", text:"tnt-Unlock"});
				aFMITypeData.push({key: "tnt-UnsuccessfulAuth", text:"tnt-UnsuccessfulAuth"});

				this.oModel = new JSONModel({
					sizeTypes: aFMISizeData,
					typeTypes: aFMITypeData
				});

				this.oModel.setProperty("/sSelectedSize", aFMISizeData[0].key);
				this.oModel.setProperty("/sSelectedType", aFMITypeData[0].key);

				this.getView().setModel(this.oModel);
			},
			onSelectSize: function (oEvent) {
				this.oModel.setProperty("/sSelectedSize", oEvent.getParameter("selectedItem").getKey());
			},
			onSelectType: function (oEvent) {
				this.oModel.setProperty("/sSelectedType", oEvent.getParameter("selectedItem").getKey());
			}
		});

	});
