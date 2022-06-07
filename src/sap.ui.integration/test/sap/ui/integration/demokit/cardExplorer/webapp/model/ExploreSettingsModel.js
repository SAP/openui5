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
		//to enable/disable menuitems of Configuration Editor button, the value can be "All", "Admin", "Content" or "Translation"
		// configMode: 'All',
		//to enable/disable Configuration Editor button
		designtimeEnabled: true,
		//to enable/disable "Show Manifest Changes" button
		manifestChanged: false,
		editorMode: 'admin'
	});
});
