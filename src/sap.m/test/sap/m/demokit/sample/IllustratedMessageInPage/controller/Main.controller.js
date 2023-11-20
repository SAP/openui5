sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			oIllustratedMessageType = library.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPage.controller.Main", {

			onInit: function () {

				var aIMISizeData = [],
					aIMITypeData = [
						{ key: oIllustratedMessageType.BeforeSearch, text: 'BeforeSearch'},
						{ key: oIllustratedMessageType.NoSearchResults, text: 'NoSearchResults'},
						{ key: oIllustratedMessageType.NoNotifications, text: 'NoNotifications'},
						{ key: oIllustratedMessageType.NoMail, text: 'NoMail'},
						{ key: oIllustratedMessageType.NoData, text: 'NoData'},
						{ key: oIllustratedMessageType.NoEntries, text: 'NoEntries'},
						{ key: oIllustratedMessageType.NoActivities, text: 'NoActivities'},
						{ key: oIllustratedMessageType.NoTasks, text: 'NoTasks'},
						{ key: oIllustratedMessageType.NoSavedItems, text: 'NoSavedItems'},
						{ key: oIllustratedMessageType.UnableToLoad, text: 'UnableToLoad'},
						{ key: oIllustratedMessageType.UnableToUpload, text: 'UnableToUpload'},
						{ key: oIllustratedMessageType.SuccessBalloon, text: 'SuccessBalloon'},
						{ key: oIllustratedMessageType.SuccessCheckMark, text: 'SuccessCheckMark'}
					];

				Object.keys(oIllustratedMessageSize).forEach(function (sKey) {
					aIMISizeData.push({key: oIllustratedMessageSize[sKey], text: sKey});
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
