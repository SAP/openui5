sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function (JSONModel, Core) {
	"use strict";

	//key for local storage
	var sStoreKey = "sap.ui.demo.cardExplorer.AppSettings";

	//the default values that currently apply for UI5
	var oDefaultsValues = {
		theme: "sap_horizon",
		contentDensity: "cozy",
		rtl: false
	};

	var oJSONModel = new JSONModel({
		theme: Core.getConfiguration().getTheme(),
		themes: [
			{
				key: "sap_horizon",
				text: "Morning Horizon (Light)"
			},
			{
				key: "sap_horizon_dark",
				text: "Evening Horizon (Dark)"
			},
			{
				key: "sap_horizon_hcb",
				text: "Horizon High Contrast Black"
			},
			{
				key: "sap_horizon_hcw",
				text: "Horizon High Contrast White"
			},
			{
				key: "sap_fiori_3",
				text: "Quartz Light"
			},
			{
				key: "sap_fiori_3_dark",
				text: "Quartz Dark"
			},
			{
				key: "sap_fiori_3_hcb",
				text: "Quartz High Contrast Black"
			},
			{
				key: "sap_fiori_3_hcw",
				text: "Quartz High Contrast White"
			},
			{
				key: "sap_belize",
				text: "Belize"
			}
		],
		contentDensity: "cozy",
		contentDensities: [
			{
				key: "cozy",
				text: "Cozy",
				selected: true
			},
			{
				key: "compact",
				text: "Compact",
				selected: false
			}
		],
		rtl: true
	});

	// resets the values to the defaults
	oJSONModel.resetValues = function () {
		Object.keys(oDefaultsValues).forEach(function (n) {
			this.setProperty("/" + n, oDefaultsValues[n]);
		}.bind(this));
	};

	// saves the selected values from the model to the local storage
	oJSONModel.saveValues = function () {
		var oSaveData = {};
		Object.keys(oDefaultsValues).forEach(function (n) {
			oSaveData[n] = this.getProperty("/" + n);
		}.bind(this));
		localStorage.setItem(sStoreKey, JSON.stringify(oSaveData));
	};

	// loads the selected values from local storage and applies it to the model
	// currently theme and rtl is checked against the current query in the url. the url settings win
	oJSONModel.loadValues = function () {
		var sLoadData = localStorage.getItem(sStoreKey);
		var oLoadData = oDefaultsValues;
		if (sLoadData) {
			try {
				oLoadData = JSON.parse(sLoadData);
			} catch (ex) {
				oLoadData = oDefaultsValues;
			}
		}
		// check and override from url settings for theme and rtl
		var oCurrentUrl = new URL(document.location.href);
		var sThemeFromURL = oCurrentUrl.searchParams.get("sap-theme") || oCurrentUrl.searchParams.get("sap-ui-theme");
		oLoadData['theme'] = sThemeFromURL ? sThemeFromURL : oLoadData['theme'];
		oLoadData['rtl'] = oCurrentUrl.searchParams.get("sap-rtl") ? true : oLoadData['rtl'];

		Object.keys(oLoadData).forEach(function (n) {
			this.setProperty("/" + n, oLoadData[n]);
		}.bind(this));
	};

	// applies the current values from the model to ui5 + document
	oJSONModel.applyValues = function () {
		//apply theme
		var sTheme = this.getProperty("/theme");
		Core.applyTheme(sTheme);
		//apply content density
		var oBody = document.body;
		oBody.classList.remove("sapUiSizeCompact");
		oBody.classList.remove("sapUiSizeCozy");
		switch (this.getProperty("/contentDensity")) {
			case "compact":
				oBody.classList.add("sapUiSizeCompact");
				break;
			default:
				oBody.classList.add("sapUiSizeCozy");
		}
		//apply rtl
		Core.getConfiguration().setRTL(this.getProperty("/rtl"));
	};

	// initially load and apply current settings
	oJSONModel.loadValues();
	oJSONModel.applyValues();

	return oJSONModel;
});