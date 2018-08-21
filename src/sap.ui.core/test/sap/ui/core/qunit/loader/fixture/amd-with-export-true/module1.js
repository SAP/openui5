sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	var result = {
		parentNamespace: jQuery.sap.getObject("fixture.amd-with-export-true")
	};

	return result;

}, /* bExport = */true);
