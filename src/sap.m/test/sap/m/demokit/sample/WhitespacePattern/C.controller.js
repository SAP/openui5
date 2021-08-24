sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.WhitespacePattern.C", {
		onInit: function () {
			this._initModel();
		},

		whitespace2Char: function (sOriginalText) {
			var sWhitespace = " ",
				sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

			if (typeof sOriginalText !== "string") {
				return sOriginalText;
			}

			return sOriginalText
				.replaceAll((sWhitespace + sWhitespace), (sWhitespace + sUnicodeWhitespaceCharacter)); // replace spaces
		},

		_initModel: function () {
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