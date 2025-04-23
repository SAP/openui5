sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			oIllustratedMessageType = library.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPageIllustrative.controller.Main", {

			onInit: function () {

				var aIMISizeData = [
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Auto], text: oIllustratedMessageSize.Auto},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Base], text: oIllustratedMessageSize.Base},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.ExtraSmall], text: oIllustratedMessageSize.ExtraSmall},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Small], text: oIllustratedMessageSize.Small},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Medium], text: oIllustratedMessageSize.Medium},
						{key: oIllustratedMessageSize[oIllustratedMessageSize.Large], text: oIllustratedMessageSize.Large}
					],
					aIMITypeData = [
						{ key: oIllustratedMessageType.SignOut, text: 'SignOut'},
						{ key: oIllustratedMessageType.BeforeSearch, text: 'BeforeSearch'},
						{ key: oIllustratedMessageType.NoSearchResults, text: 'NoSearchResults'},
						{ key: oIllustratedMessageType.NoFilterResults, text: 'NoFilterResults'},
						{ key: oIllustratedMessageType.PageNotFound, text: 'PageNotFound'},
						{ key: oIllustratedMessageType.NoNotifications, text: 'NoNotifications'},
						{ key: oIllustratedMessageType.NoSavedItems, text: 'NoSavedItems'},
						{ key: oIllustratedMessageType.NewMail, text: 'NewMail'},
						{ key: oIllustratedMessageType.NoData, text: 'NoData'},
						{ key: oIllustratedMessageType.NoEntries, text: 'NoEntries'},
						{ key: oIllustratedMessageType.NoActivities, text: 'NoActivities'},
						{ key: oIllustratedMessageType.AddingColumns, text: 'AddingColumns'},
						{ key: oIllustratedMessageType.SortingColumns, text: 'SortingColumns'},
						{ key: oIllustratedMessageType.NoColumnsSet, text: 'NoColumnsSet'},
						{ key: oIllustratedMessageType.FilteringColumns, text: 'FilteringColumns'},
						{ key: oIllustratedMessageType.ResizingColumns, text: 'ResizingColumns'},
						{ key: oIllustratedMessageType.GroupingColumns, text: 'GroupingColumns'},
						{ key: oIllustratedMessageType.EmptyPlanningCalendar, text: 'EmptyPlanningCalendar'},
						{ key: oIllustratedMessageType.AddPeopleToCalendar, text: 'AddPeopleToCalendar'},
						{ key: oIllustratedMessageType.DragFilesToUpload, text: 'DragFilesToUpload'},
						{ key: oIllustratedMessageType.AddDimensions, text: 'AddDimensions'},
						{ key: oIllustratedMessageType.UploadToCloud, text: 'UploadToCloud'},
						{ key: oIllustratedMessageType.UnableToLoad, text: 'UnableToLoad'},
						{ key: oIllustratedMessageType.UnableToUpload, text: 'UnableToUpload'},
						{ key: oIllustratedMessageType.Connection, text: 'Connection'},
						{ key: oIllustratedMessageType.UnableToLoadImage, text: 'UnableToLoadImage'},
						{ key: oIllustratedMessageType.BalloonSky, text: 'BalloonSky'},
						{ key: oIllustratedMessageType.KeyTask, text: 'KeyTask'},
						{ key: oIllustratedMessageType.ReceiveAppreciation, text: 'ReceiveAppreciation'},
						{ key: oIllustratedMessageType.Survey, text: 'Survey'},
						{ key: oIllustratedMessageType.NoChartData, text: 'NoChartData'}
					];

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
