sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/library",
	"sap/tnt/library"
], function (JSONModel, Controller, library, tntLib) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			IllustratedMessageType = tntLib.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPageTNT.controller.Main", {

			onInit: function () {

				var aIMISizeData = [],
					aIMITypeDataTemp = [{key: "tnt-FaceID", text:"FaceID"}];

				Object.keys(oIllustratedMessageSize).forEach(function (sKey) {
					aIMISizeData.push({key: oIllustratedMessageSize[sKey], text: sKey});
				});

				this.oModel = new JSONModel({
					sizeTypes: aIMISizeData,
					typeTypes: aIMITypeDataTemp
				});

				this.oModel.setProperty("/sSelectedSize", aIMISizeData[0].key);
				this.oModel.setProperty("/sSelectedType", aIMITypeDataTemp[0].key);

				this._populateIllustrationTypes();

				this.getView().setModel(this.oModel);
			},
			onSelectSize: function (oEvent) {
				this.oModel.setProperty("/sSelectedSize", oEvent.getParameter("selectedItem").getKey());
			},
			onSelectType: function (oEvent) {
				this.oModel.setProperty("/sSelectedType", oEvent.getParameter("selectedItem").getKey());
			},
			_populateIllustrationTypes: function () {
				var aIMITypeData = [];
				Object.keys(IllustratedMessageType).forEach(function (sKey) {
					aIMITypeData.push({key: IllustratedMessageType[sKey], text: sKey});
				}, this);
				this.oModel.setProperty("/typeTypes", aIMITypeData);
				this.oModel.setProperty("/sSelectedType", aIMITypeData[0].key);
			}
		});

	});
