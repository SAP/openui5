sap.ui.define([
	"./NumberFormat.controller",
	"./FormatHelper",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView"
], function(NumberFormatController, FormatHelper, oCore, XMLView) {
	"use strict";

	sap.ui.define("local/LocaleListItem", function() {
		return FormatHelper.LocaleListItem;
	});

	XMLView.create({
		viewName: "local.NumberFormat",
		controller: new NumberFormatController()
	}).then(function(oView) {
		oCore.getMessageManager().registerObject(oView.getContent()[0], true);
		oView.placeAt("content");
	});
});

