sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		autoRun: true,
		schemaValidation: false,
		splitViewVertically: false,
		editable: true,
		internal: window._isinternal
	});
});
