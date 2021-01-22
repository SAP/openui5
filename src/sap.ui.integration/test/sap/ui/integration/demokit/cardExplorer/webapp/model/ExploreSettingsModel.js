sap.ui.define([
	"../Constants",
	"sap/ui/model/json/JSONModel"
], function (Constants, JSONModel) {
	"use strict";

	return new JSONModel({
		autoRun: true,
		schemaValidation: false,
		splitViewVertically: false,
		editable: true,
		editorType: Constants.EDITOR_TYPE.TEXT,
		internal: window._isinternal
	});
});
