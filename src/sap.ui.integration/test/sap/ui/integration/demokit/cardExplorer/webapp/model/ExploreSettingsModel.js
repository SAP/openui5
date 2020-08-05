sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		autoRun: true,
		schemaValidation: false,
		splitViewVertically: false,
		editable: true,
		editorType: "text",
		designtime: sap.ui.version.includes('SNAPSHOT') && !window.location.host.includes("openui5nightly")
	});
});
