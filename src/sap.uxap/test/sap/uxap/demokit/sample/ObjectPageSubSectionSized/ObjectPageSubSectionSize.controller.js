sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Device, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageSubSectionSized.ObjectPageSubSectionSize", {
		onInit: function () {
			this.oJsonConfigModel = new JSONModel(
				{
					subSectionLayout: "TitleOnTop",
					useTwoColumnsForLargeScreen: false
				});
			this.getView().setModel(this.oJsonConfigModel, "ConfigModel");
			this.isTitleOnTop = true;
			this.bUseTwoColumns = false;
		},

		toggleTitle: function () {

			this.isTitleOnTop = !(this.isTitleOnTop);
			this.oJsonConfigModel.setProperty("/subSectionLayout", this.isTitleOnTop ? "TitleOnTop" : "TitleOnLeft");
		},
		toggleUseTwoColumns: function () {
			this.bUseTwoColumns = !(this.bUseTwoColumns);
			this.oJsonConfigModel.setProperty("/useTwoColumnsForLargeScreen", this.bUseTwoColumns);
		}
	});
}, true);
