sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/base/i18n/Localization",
	"./highlighter",
	"./formatter"
], function(Controller, JSONModel, Localization, highlighter, formatter) {
	"use strict";
	return Controller.extend("sap.ui.demo.terminologies.App", {
		formatter: formatter,
		onInit : function () {
			var aActiveTerminologies = Localization.getActiveTerminologies();
			var sActiveTerminology = "none";
			if (aActiveTerminologies) {
				sActiveTerminology = aActiveTerminologies[0];
			}
			var oUriParameters = new URLSearchParams(window.location.search);
			var sManifest = oUriParameters.get("manifest") || "base";
			var sLanguage = Localization.getLanguage() || "de";

			this.getView().setModel(new JSONModel({
				terminologies: [
					{name:"None", id: "none"},
					{name:"Terminology 1", id:"terminology1"},
					{name:"Terminology 2", id:"terminology2"}
				],
				apps: [
					{name:"AppVar 2", id: "appvar2"},
					{name:"AppVar 1", id: "appvar1"},
					{name:"Base", id:"base"}
				],
				languages: [
					{name:"Deutsch", id:"de"},
					{name:"English", id: "en"}
				],
				selectedKey: sActiveTerminology,
				selectedKeyApp: sManifest,
				selectedKeyLang: sLanguage
			}));

			// highlight modifies the html content therefore it must be done before moving the html content to HTML control
			highlighter.highlight(this.getView(), sActiveTerminology, sManifest);
			var oMySvg = document.getElementById("configurationImage");

			var sInnerHtml = oMySvg.innerHTML;
			oMySvg.remove();

			var oMyImageHtmlControl = this.getView().byId("htmlConfigurationImage");
			oMyImageHtmlControl.setContent(sInnerHtml);

		},

		onChangeTerminology: function (oEvent) {
			var sActiveTerminology = oEvent.getParameter("selectedItem").getProperty("key");
			if (sActiveTerminology === "none") {
				sActiveTerminology = "";
			}
			this._modifyUrlParameter("sap-ui-activeTerminologies", sActiveTerminology);
		},

		onChangeApp: function (oEvent) {
			var sApp = oEvent.getParameter("selectedItem").getProperty("key");
			if (sApp === "base") {
				sApp = "";
			}
			this._modifyUrlParameter("manifest", sApp);
		},


		onChangeLanguage: function (oEvent) {
			var sLanguage = oEvent.getParameter("selectedItem").getProperty("key");
			this._modifyUrlParameter("sap-ui-language", sLanguage);
		},

		_modifyUrlParameter: function (sParameter, sNewValue) {
			if (document.location.href.indexOf(sParameter) > -1) {
				document.location.href = document.location.href.replace(new RegExp(sParameter + "=[A-Za-z0-9_-]*"), sParameter + "=" + sNewValue);
			} else if (document.location.href.indexOf("?") > -1) {
				document.location.href += "&" + sParameter + "=" + sNewValue;
			} else {
				document.location.href += "?" + sParameter + "=" + sNewValue;
			}
		}
	});
});