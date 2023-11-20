sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/library",
	"sap/ui/thirdparty/jquery"
], function (JSONModel, Controller, library, jQuery) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize;

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

				this._loadMetadata(sap.ui.require.toUrl('sap/tnt/themes/base/illustrations/metadata.json'),
				this._populateIllustrationTypes.bind(this));

				this.getView().setModel(this.oModel);
			},
			onSelectSize: function (oEvent) {
				this.oModel.setProperty("/sSelectedSize", oEvent.getParameter("selectedItem").getKey());
			},
			onSelectType: function (oEvent) {
				this.oModel.setProperty("/sSelectedType", oEvent.getParameter("selectedItem").getKey());
			},
			_loadMetadata: function(sMetadataPath, fCallBack) {

				return new Promise(function (fnResolve) {
					jQuery.ajax(sMetadataPath, {
						type: "GET",
						dataType: "json",
						success: function (oMetadataJSON) {
							fCallBack(oMetadataJSON);
							fnResolve();
						}
					});
				});
			},
			_populateIllustrationTypes: function (oMetadata) {
				var aIMITypeData = [];
				oMetadata.symbols.forEach(function (sType) {
					aIMITypeData.push({key: "tnt-" + sType, text: sType});
				}, this);
				this.oModel.setProperty("/typeTypes", aIMITypeData);
				this.oModel.setProperty("/sSelectedType", aIMITypeData[0].key);
			}
		});

	});
