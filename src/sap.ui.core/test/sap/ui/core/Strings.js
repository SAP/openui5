sap.ui.define([
	"./Strings.controller",
	"./FormatHelper",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView"
], function(StringsController, FormatHelper, oCore, XMLView) {
	"use strict";

	sap.ui.define("local/LocaleListItem", function() {
		return FormatHelper.LocaleListItem;
	});

	XMLView.create({
		viewName: "local.Strings",
		controller: new StringsController()
	}).then(function(oView) {
		oCore.getMessageManager().registerObject(oView.getContent()[0], true);
		oView.placeAt("content");
	});
});