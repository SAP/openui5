sap.ui.require([
	"sap/base/i18n/Formatting"
], (
	Formatting
) => {
	"use strict";

	window["sap-ui-config"] = window["sap-ui-config"] || {};
	window["sap-ui-config"]["xx-bootTask"] = function(callback) {
		// Calendar type is changed to "Japanese" after ABAP date format is set to "7"
		Formatting.setABAPDateFormat("7");
		callback();
	};

});