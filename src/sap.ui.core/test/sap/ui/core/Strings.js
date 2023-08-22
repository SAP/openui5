sap.ui.define([
	"./Strings.controller",
	"./FormatHelper",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/XMLView"
], function(StringsController, FormatHelper, Messaging, XMLView) {
	"use strict";

	sap.ui.define("local/LocaleListItem", function() {
		return FormatHelper.LocaleListItem;
	});

	XMLView.create({
		viewName: "local.Strings",
		controller: new StringsController()
	}).then(function(oView) {
		Messaging.registerObject(oView.getContent()[0], true);
		oView.placeAt("content");
	});
});