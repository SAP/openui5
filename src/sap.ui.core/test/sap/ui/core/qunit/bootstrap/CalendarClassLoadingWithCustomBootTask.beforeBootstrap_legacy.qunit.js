/**
 * @fileoverview
 * @deprecated
 */
(function() {
	"use strict";

	window["sap-ui-config"] = window["sap-ui-config"] || {};
	window["sap-ui-config"]["xx-bootTask"] = function(callback) {
		// Calendar type is changed to "Japanese" after legacy date format is set to "7"
		sap.ui.getCore().getConfiguration().getFormatSettings().setLegacyDateFormat("7");
		callback();
	};

}());