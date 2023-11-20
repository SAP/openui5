sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var oIllustratedMessageSize = library.IllustratedMessageSize,
			oIllustratedMessageType = library.IllustratedMessageType;

		return Controller.extend("sap.m.sample.IllustratedMessageInPageSimple.controller.Main", {

			onInit: function () {

				var aIMISizeData = [],
					aIMITypeData = [
						{ key: oIllustratedMessageType.SimpleBalloon, text: 'SimpleBalloon'},
						{ key: oIllustratedMessageType.SimpleBell, text: 'SimpleBell'},
						{ key: oIllustratedMessageType.SimpleCalendar, text: 'SimpleCalendar'},
						{ key: oIllustratedMessageType.SimpleCheckMark, text: 'SimpleCheckMark'},
						{ key: oIllustratedMessageType.SimpleConnection, text: 'SimpleConnection'},
						{ key: oIllustratedMessageType.SimpleEmptyDoc, text: 'SimpleEmptyDoc'},
						{ key: oIllustratedMessageType.SimpleEmptyList, text: 'SimpleEmptyList'},
						{ key: oIllustratedMessageType.SimpleError, text: 'SimpleError'},
						{ key: oIllustratedMessageType.SimpleMagnifier, text: 'SimpleMagnifier'},
						{ key: oIllustratedMessageType.SimpleMail, text: 'SimpleMail'},
						{ key: oIllustratedMessageType.SimpleNoSavedItems, text: 'SimpleNoSavedItems'},
						{ key: oIllustratedMessageType.SimpleNotFoundMagnifier, text: 'SimpleNotFoundMagnifier'},
						{ key: oIllustratedMessageType.SimpleReload, text: 'SimpleReload'},
						{ key: oIllustratedMessageType.SimpleTask, text: 'SimpleTask'}
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
