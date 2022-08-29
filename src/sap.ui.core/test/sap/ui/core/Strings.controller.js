sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Configuration"
], function(NumberFormat, Controller, JSONModel, Configuration) {
	"use strict";

	return Controller.extend("DateFormat", {
		onInit: function() {

			var aChars = [
				{custom: "LRE", code: "202a"},
				{custom: "RLE", code: "202b"},
				{custom: "LRO", code: "202d"},
				{custom: "RLO", code: "202e"},
				{custom: "PDF", code: "202c"},
				{custom: "LRM", code: "200e"},
				{custom: "RLM", code: "2004"},
				{custom: "SPACE", code: "20"},
				{custom: "SPACE1", code: "a0"},
				{custom: "DQUOTE", code: "22"},
				{custom: "CURRENCY", code: "a4"}
			];

			var mCodeToCustom = {};
			var mCustomToCode = {};
			aChars.forEach(function(oChar) {
				mCodeToCustom[oChar.code] = oChar.custom;
				mCustomToCode[oChar.custom] = oChar.code;
			});

			this.codeToPrinted = function(input) {
				return mCodeToCustom[input] || input;
			};

			this.printedToCode = function(input) {
				return mCustomToCode[input] || input;
			};

			var oModel = new JSONModel({
				string: "abc 123",
				rtl: "LTR"
			});
			this.getView().setModel(oModel);

			var oModelSpecialChars = new JSONModel({
				rows: aChars
			});
			this.getView().setModel(oModelSpecialChars, "specialChars");
		},

		formatAsHex: function(sString) {
			return sString.split("").map(function(sChar) {
				return sChar.charCodeAt(0).toString(16);
			}).join(" ");
		},

		formatAsHexCustom: function(sString) {
			return sString.split("").map(function(sChar) {
				var sCharCode = sChar.charCodeAt(0).toString(16);
				return this.codeToPrinted(sCharCode);
			}, this).join(" ");
		},

		onRTLChange: function(oEvent) {
			var bState = oEvent.getParameter("state");
			Configuration.setRTL(bState);
			this.getView().getModel().setProperty("/rtl", bState ? "RTL" : "LTR");
		},

		onHexChanged: function(oEvent) {
			var sValue = oEvent.getParameter("value").trim();
			var sResult = sValue.split(" ").map(function(sChar) {
				return String.fromCharCode(parseInt(sChar, 16));
			}).join("");
			this.getView().getModel().setProperty("/string", sResult);
		},

		onHexCustomChanged: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			sValue = sValue.trim();
			var sResult = sValue.split(" ").map(function(sChar) {
				sChar = this.printedToCode(sChar);
				return String.fromCharCode(parseInt(sChar, 16));
			}, this).join("");
			this.getView().getModel().setProperty("/string", sResult);
		}
	});
});
