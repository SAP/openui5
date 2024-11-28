sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize;

		return Controller.extend("sap.m.sample.IllustratedMessageInPageWithURI.controller.Main", {

			onInit: function () {

				var aIMISizeData = [],
					aIMITypeData = [
						{ key: "sap-illustration://BeforeSearch", text: "sap-illustration://BeforeSearch" },
						{ key: "sap-illustration://NoActivities", text: "sap-illustration://NoActivities" },
						{ key: "sap-illustration://NoData", text: "sap-illustration://NoData" },
						{ key: "sap-illustration://NoMail", text: "sap-illustration://NoMail" },
						{ key: "sap-illustration://NoMail_v1", text: "sap-illustration://NoMail_v1" },
						{ key: "sap-illustration://NoEntries", text: "sap-illustration://NoEntries" },
						{ key: "sap-illustration://NoNotifications", text: "sap-illustration://NoNotifications" },
						{ key: "sap-illustration://NoSavedItems", text: "sap-illustration://NoSavedItems" },
						{ key: "sap-illustration://NoSavedItems_v1", text: "sap-illustration://NoSavedItems_v1" },
						{ key: "sap-illustration://NoSearchResults", text: "sap-illustration://NoSearchResults" },
						{ key: "sap-illustration://NoTasks", text: "sap-illustration://NoTasks" },
						{ key: "sap-illustration://NoTasks_v1", text: "sap-illustration://NoTasks_v1" },
						{ key: "sap-illustration://NoDimensionsSet", text: "sap-illustration://NoDimensionsSet" },
						{ key: "sap-illustration://NoColumnsSet", text: "sap-illustration://NoColumnsSet" },
						{ key: "sap-illustration://UnableToLoad", text: "sap-illustration://UnableToLoad" },
						{ key: "sap-illustration://UnableToLoadImage", text: "sap-illustration://UnableToLoadImage" },
						{ key: "sap-illustration://UnableToUpload", text: "sap-illustration://UnableToUpload" },
						{ key: "sap-illustration://UploadToCloud", text: "sap-illustration://UploadToCloud" },
						{ key: "sap-illustration://AddColumn", text: "sap-illustration://AddColumn" },
						{ key: "sap-illustration://AddPeople", text: "sap-illustration://AddPeople" },
						{ key: "sap-illustration://AddDimensions", text: "sap-illustration://AddDimensions" },
						{ key: "sap-illustration://BalloonSky", text: "sap-illustration://BalloonSky" },
						{ key: "sap-illustration://Connection", text: "sap-illustration://Connection" },
						{ key: "sap-illustration://EmptyCalendar", text: "sap-illustration://EmptyCalendar" },
						{ key: "sap-illustration://EmptyList", text: "sap-illustration://EmptyList" },
						{ key: "sap-illustration://EmptyPlanningCalendar", text: "sap-illustration://EmptyPlanningCalendar" },
						{ key: "sap-illustration://ErrorScreen", text: "sap-illustration://ErrorScreen" },
						{ key: "sap-illustration://FilterTable", text: "sap-illustration://FilterTable" },
						{ key: "sap-illustration://GroupTable", text: "sap-illustration://GroupTable" },
						{ key: "sap-illustration://NewMail", text: "sap-illustration://NewMail" },
						{ key: "sap-illustration://NoFilterResults", text: "sap-illustration://NoFilterResults" },
						{ key: "sap-illustration://PageNotFound", text: "sap-illustration://PageNotFound" },
						{ key: "sap-illustration://ReloadScreen", text: "sap-illustration://ReloadScreen" },
						{ key: "sap-illustration://ResizeColumn", text: "sap-illustration://ResizeColumn" },
						{ key: "sap-illustration://SearchEarth", text: "sap-illustration://SearchEarth" },
						{ key: "sap-illustration://SearchFolder", text: "sap-illustration://SearchFolder" },
						{ key: "sap-illustration://SignOut", text: "sap-illustration://SignOut" },
						{ key: "sap-illustration://SimpleBalloon", text: "sap-illustration://SimpleBalloon" },
						{ key: "sap-illustration://SimpleBell", text: "sap-illustration://SimpleBell" },
						{ key: "sap-illustration://SimpleCalendar", text: "sap-illustration://SimpleCalendar" },
						{ key: "sap-illustration://SimpleCheckMark", text: "sap-illustration://SimpleCheckMark" },
						{ key: "sap-illustration://SimpleConnection", text: "sap-illustration://SimpleConnection" },
						{ key: "sap-illustration://SimpleEmptyDoc", text: "sap-illustration://SimpleEmptyDoc" },
						{ key: "sap-illustration://SimpleEmptyList", text: "sap-illustration://SimpleEmptyList" },
						{ key: "sap-illustration://SimpleError", text: "sap-illustration://SimpleError" },
						{ key: "sap-illustration://SimpleMagnifier", text: "sap-illustration://SimpleMagnifier" },
						{ key: "sap-illustration://SimpleMail", text: "sap-illustration://SimpleMail" },
						{ key: "sap-illustration://SimpleNoSavedItems", text: "sap-illustration://SimpleNoSavedItems" },
						{ key: "sap-illustration://SimpleNotFoundMagnifier", text: "sap-illustration://SimpleNotFoundMagnifier" },
						{ key: "sap-illustration://SimpleReload", text: "sap-illustration://SimpleReload" },
						{ key: "sap-illustration://SimpleTask", text: "sap-illustration://SimpleTask" },
						{ key: "sap-illustration://SleepingBell", text: "sap-illustration://SleepingBell" },
						{ key: "sap-illustration://SortColumn", text: "sap-illustration://SortColumn" },
						{ key: "sap-illustration://SuccessBalloon", text: "sap-illustration://SuccessBalloon" },
						{ key: "sap-illustration://SuccessCheckMark", text: "sap-illustration://SuccessCheckMark" },
						{ key: "sap-illustration://SuccessHighFive", text: "sap-illustration://SuccessHighFive" },
						{ key: "sap-illustration://SuccessScreen", text: "sap-illustration://SuccessScreen" },
						{ key: "sap-illustration://Survey", text: "sap-illustration://Survey" },
						{ key: "sap-illustration://Tent", text: "sap-illustration://Tent" },
						{ key: "sap-illustration://UploadCollection", text: "sap-illustration://UploadCollection" },
						// tnt
						{ key: "sap-illustration://tnt/Calculator", text: "sap-illustration://tnt/Calculator" },
						{ key: "sap-illustration://tnt/ChartArea", text: "sap-illustration://tnt/ChartArea" },
						{ key: "sap-illustration://tnt/ChartArea2", text: "sap-illustration://tnt/ChartArea2" },
						{ key: "sap-illustration://tnt/ChartBar", text: "sap-illustration://tnt/ChartBar" },
						{ key: "sap-illustration://tnt/ChartBPMNFlow", text: "sap-illustration://tnt/ChartBPMNFlow" },
						{ key: "sap-illustration://tnt/ChartBullet", text: "sap-illustration://tnt/ChartBullet" },
						{ key: "sap-illustration://tnt/ChartDoughnut", text: "sap-illustration://tnt/ChartDoughnut" },
						{ key: "sap-illustration://tnt/ChartFlow", text: "sap-illustration://tnt/ChartFlow" },
						{ key: "sap-illustration://tnt/ChartGantt", text: "sap-illustration://tnt/ChartGantt" },
						{ key: "sap-illustration://tnt/ChartOrg", text: "sap-illustration://tnt/ChartOrg" },
						{ key: "sap-illustration://tnt/ChartPie", text: "sap-illustration://tnt/ChartPie" },
						{ key: "sap-illustration://tnt/CodePlaceholder", text: "sap-illustration://tnt/CodePlaceholder" },
						{ key: "sap-illustration://tnt/Company", text: "sap-illustration://tnt/Company" },
						{ key: "sap-illustration://tnt/Compass", text: "sap-illustration://tnt/Compass" },
						{ key: "sap-illustration://tnt/Components", text: "sap-illustration://tnt/Components" },
						{ key: "sap-illustration://tnt/Dialog", text: "sap-illustration://tnt/Dialog" },
						{ key: "sap-illustration://tnt/ExternalLink", text: "sap-illustration://tnt/ExternalLink" },
						{ key: "sap-illustration://tnt/FaceID", text: "sap-illustration://tnt/FaceID" },
						{ key: "sap-illustration://tnt/Fingerprint", text: "sap-illustration://tnt/Fingerprint" },
						{ key: "sap-illustration://tnt/Handshake", text: "sap-illustration://tnt/Handshake" },
						{ key: "sap-illustration://tnt/Help", text: "sap-illustration://tnt/Help" },
						{ key: "sap-illustration://tnt/Lock", text: "sap-illustration://tnt/Lock" },
						{ key: "sap-illustration://tnt/Mission", text: "sap-illustration://tnt/Mission" },
						{ key: "sap-illustration://tnt/MissionFailed", text: "sap-illustration://tnt/MissionFailed" },
						{ key: "sap-illustration://tnt/NoApplications", text: "sap-illustration://tnt/NoApplications" },
						{ key: "sap-illustration://tnt/NoFlows", text: "sap-illustration://tnt/NoFlows" },
						{ key: "sap-illustration://tnt/NoUsers", text: "sap-illustration://tnt/NoUsers" },
						{ key: "sap-illustration://tnt/Radar", text: "sap-illustration://tnt/Radar" },
						{ key: "sap-illustration://tnt/RoadMap", text: "sap-illustration://tnt/RoadMap" },
						{ key: "sap-illustration://tnt/Secrets", text: "sap-illustration://tnt/Secrets" },
						{ key: "sap-illustration://tnt/Services", text: "sap-illustration://tnt/Services" },
						{ key: "sap-illustration://tnt/SessionExpired", text: "sap-illustration://tnt/SessionExpired" },
						{ key: "sap-illustration://tnt/SessionExpiring", text: "sap-illustration://tnt/SessionExpiring" },
						{ key: "sap-illustration://tnt/Settings", text: "sap-illustration://tnt/Settings" },
						{ key: "sap-illustration://tnt/Success", text: "sap-illustration://tnt/Success" },
						{ key: "sap-illustration://tnt/SuccessfulAuth", text: "sap-illustration://tnt/SuccessfulAuth" },
						{ key: "sap-illustration://tnt/Systems", text: "sap-illustration://tnt/Systems" },
						{ key: "sap-illustration://tnt/Teams", text: "sap-illustration://tnt/Teams" },
						{ key: "sap-illustration://tnt/Tools", text: "sap-illustration://tnt/Tools" },
						{ key: "sap-illustration://tnt/Tutorials", text: "sap-illustration://tnt/Tutorials" },
						{ key: "sap-illustration://tnt/UnableToLoad", text: "sap-illustration://tnt/UnableToLoad" },
						{ key: "sap-illustration://tnt/Unlock", text: "sap-illustration://tnt/Unlock" },
						{ key: "sap-illustration://tnt/UnsuccessfulAuth", text: "sap-illustration://tnt/UnsuccessfulAuth" },
						{ key: "sap-illustration://tnt/User2", text: "sap-illustration://tnt/User2" }
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
