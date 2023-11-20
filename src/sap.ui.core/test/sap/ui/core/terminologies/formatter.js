sap.ui.define([], function () {
	"use strict";
	return {
		i18ntext: function (sTranslatedText) {
			if (sTranslatedText.indexOf("_KEY") >= 0) {
				return "NOT DEFINED";
			}
			return sTranslatedText;
		}
	};
});