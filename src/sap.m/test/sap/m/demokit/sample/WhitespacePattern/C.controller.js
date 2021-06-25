sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.WhitespacePattern.C", {
		onInit: function () {
			this._refreshModel();
		},

		whitespace2Char: function (sOriginalText) {
			var oWhitespaceModel = this.getView().getModel("whitespace");
			var sWhitespaceChar = oWhitespaceModel.getProperty("/selectedCharacter");

			return (sOriginalText || "").replace(/ {2,}/g, function (match) {
				return " ".padStart(match.length * sWhitespaceChar.length, sWhitespaceChar);
			});
		},

		handleWhiteSpaceChange: function (oEvent) {
			var oWhitespaceModel = this.getView().getModel("whitespace");
			var oSelectedItem = oEvent.getParameter("selectedItem");

			if (oSelectedItem) {
				oWhitespaceModel.setProperty("/selectedCharacter", oSelectedItem.getKey());
				this._refreshModel();
			}
		},

		_refreshModel: function () {
			var oModel = this.getView().getModel();
			var oData = [];
			var i, iInverted;
			var sSampleText = "Text with {W}{X} whitespaces";
			var sAdditionalText = "Additional text with {W}{X} whitespaces";

			oModel.setData([]);

			for (i = 1, iInverted = 10; i <= 10; i++, iInverted--) {
				oData.push({
					key: i,
					text: sSampleText.replace("{X}", i).replace("{W}", new Array(i).join(" ")),
					additionalText: sAdditionalText.replace("{X}", iInverted).replace("{W}", new Array(iInverted).join(" "))
				});
			}

			oModel.setData(oData);
		}
	});

	return CController;
});