/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.ui.unified library to the support infrastructure.
 */
sap.ui.define(["jquery.sap.global", "sap/ui/support/library",
			   "./rules/FileUploader.support"],
	function(jQuery, SupportLib,
			 FileUploaderSupport) {
	"use strict";

	return {
		name: "sap.ui.unified",
		niceName: "UI5 Main Library",
		ruleset: [
			FileUploaderSupport
		]
	};

}, true);
