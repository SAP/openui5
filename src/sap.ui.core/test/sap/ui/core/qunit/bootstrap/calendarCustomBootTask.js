sap.ui.define([
	"sap/base/i18n/Formatting"
], (
	Formatting
) => {
	"use strict";

	// Calendar type is changed to "Japanese" after ABAP date format is set to "7"
	Formatting.setABAPDateFormat("7");

	return {
		run: () => {
			return Promise.resolve();
		}
	};
});