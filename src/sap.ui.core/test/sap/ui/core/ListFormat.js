sap.ui.define([
	"./ListFormat.controller",
	"./FormatHelper",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/XMLView"
], function(ListFormatController, FormatHelper, Messaging, XMLView) {
	"use strict";

	sap.ui.define("local/LocaleListItem", function() {
		return FormatHelper.LocaleListItem;
	});

	XMLView.create({
		viewName: "local.ListFormat",
		controller: new ListFormatController()
	}).then(function(oView) {
		Messaging.registerObject(oView.getContent()[0], true);
		oView.placeAt("content");
	});

});
