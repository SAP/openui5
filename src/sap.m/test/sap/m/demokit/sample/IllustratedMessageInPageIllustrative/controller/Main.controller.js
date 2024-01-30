sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			oIllustratedMessageType = library.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPageIllustrative.controller.Main", {

			onInit: function () {

				var aIMISizeData = [],
					aIMITypeData = [
						{ key: oIllustratedMessageType.SignOut, text: 'SignOut'},
						{ key: oIllustratedMessageType.SearchEarth, text: 'SearchEarth'},
						{ key: oIllustratedMessageType.SearchFolder, text: 'SearchFolder'},
						{ key: oIllustratedMessageType.NoFilterResults, text: 'NoFilterResults'},
						{ key: oIllustratedMessageType.PageNotFound, text: 'PageNotFound'},
						{ key: oIllustratedMessageType.SleepingBell, text: 'SleepingBell'},
						{ key: oIllustratedMessageType.NewMail, text: 'NewMail'},
						{ key: oIllustratedMessageType.NoMailV1, text: 'NoMailV1'},
						{ key: oIllustratedMessageType.Tent, text: 'Tent'},
						{ key: oIllustratedMessageType.EmptyList, text: 'EmptyList'},
						{ key: oIllustratedMessageType.EmptyCalendar, text: 'EmptyCalendar'},
						{ key: oIllustratedMessageType.NoTasksV1, text: 'NoTasksV1'},
						{ key: oIllustratedMessageType.NoSavedItemsV1, text: 'NoSavedItemsV1'},
						{ key: oIllustratedMessageType.AddColumn, text: 'AddColumn'},
						{ key: oIllustratedMessageType.SortColumn, text: 'SortColumn'},
						{ key: oIllustratedMessageType.NoColumnsSet, text: 'NoColumnsSet'},
						{ key: oIllustratedMessageType.FilterTable, text: 'FilterTable'},
						{ key: oIllustratedMessageType.ResizeColumn, text: 'ResizeColumn'},
						{ key: oIllustratedMessageType.GroupTable, text: 'GroupTable'},
						{ key: oIllustratedMessageType.EmptyPlanningCalendar, text: 'EmptyPlanningCalendar'},
						{ key: oIllustratedMessageType.AddPeople, text: 'AddPeople'},
						{ key: oIllustratedMessageType.UploadCollection, text: 'UploadCollection'},
						{ key: oIllustratedMessageType.NoDimensionsSet, text: 'NoDimensionsSet'},
						{ key: oIllustratedMessageType.AddDimensions, text: 'AddDimensions'},
						{ key: oIllustratedMessageType.UploadToCloud, text: 'UploadToCloud'},
						{ key: oIllustratedMessageType.ReloadScreen, text: 'ReloadScreen'},
						{ key: oIllustratedMessageType.ErrorScreen, text: 'ErrorScreen'},
						{ key: oIllustratedMessageType.Connection, text: 'Connection'},
						{ key: oIllustratedMessageType.UnableToLoadImage, text: 'UnableToLoadImage'},
						{ key: oIllustratedMessageType.BalloonSky, text: 'BalloonSky'},
						{ key: oIllustratedMessageType.SuccessScreen, text: 'SuccessScreen'},
						{ key: oIllustratedMessageType.SuccessHighFive, text: 'SuccessHighFive'},
						{ key: oIllustratedMessageType.Survey, text: 'Survey'}
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
