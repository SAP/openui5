sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			oIllustratedMessageType = library.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPage.controller.Main", {

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
						{ key: oIllustratedMessageType.Achievement, text: 'Achievement'},
						{ key: oIllustratedMessageType.AddDimensions, text: 'AddDimensions'},
						{ key: oIllustratedMessageType.AddPeopleToCalendar, text: 'AddPeopleToCalendar'},
						{ key: oIllustratedMessageType.AddingColumns, text: 'AddingColumns'},
						{ key: oIllustratedMessageType.BeforeSearch, text: 'BeforeSearch'},
						{ key: oIllustratedMessageType.DragFilesToUpload, text: 'DragFilesToUpload'},
						{ key: oIllustratedMessageType.EmptyPlanningCalendar, text: 'EmptyPlanningCalendar'},
						{ key: oIllustratedMessageType.FilteringColumns, text: 'FilteringColumns'},
						{ key: oIllustratedMessageType.GroupingColumns, text: 'GroupingColumns'},
						{ key: oIllustratedMessageType.KeyTask, text: 'KeyTask'},
						{ key: oIllustratedMessageType.PageNotFound, text: 'PageNotFound'},
						{ key: oIllustratedMessageType.ResizingColumns, text: 'ResizingColumns'},
						{ key: oIllustratedMessageType.NewMail, text: 'NewMail'},
						{ key: oIllustratedMessageType.NoColumnsSet, text: 'NoColumnsSet'},
						{ key: oIllustratedMessageType.NoChartData, text: 'NoChartData'},
						{ key: oIllustratedMessageType.NoSearchResults, text: 'NoSearchResults'},
						{ key: oIllustratedMessageType.NoNotifications, text: 'NoNotifications'},
						{ key: oIllustratedMessageType.NoFilterResults, text: 'NoFilterResults'},
						{ key: oIllustratedMessageType.NoMail, text: 'NoMail'},
						{ key: oIllustratedMessageType.NoData, text: 'NoData'},
						{ key: oIllustratedMessageType.NoActivities, text: 'NoActivities'},
						{ key: oIllustratedMessageType.NoEntries, text: 'NoEntries'},
						{ key: oIllustratedMessageType.NoTasks, text: 'NoTasks'},
						{ key: oIllustratedMessageType.NoSavedItems, text: 'NoSavedItems'},
						{ key: oIllustratedMessageType.ReceiveAppreciation, text: 'ReceiveAppreciation'},
						{ key: oIllustratedMessageType.UnableToLoad, text: 'UnableToLoad'},
						{ key: oIllustratedMessageType.UnableToLoadImage, text: 'UnableToLoadImage'},
						{ key: oIllustratedMessageType.UploadToCloud, text: 'UploadToCloud'},
						{ key: oIllustratedMessageType.UnableToUpload, text: 'UnableToUpload'},
						{ key: oIllustratedMessageType.UserHasSignedUp, text: 'UserHasSignedUp'},
						{ key: oIllustratedMessageType.SignOut, text: 'SignOut'},
						{ key: oIllustratedMessageType.SortingColumns, text: 'SortingColumns'}
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
