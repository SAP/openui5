sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return new JSONModel({
		playgroundBaseUrl: sap.ui.require.toUrl("sap/f/cardsdemo/")
	});
});