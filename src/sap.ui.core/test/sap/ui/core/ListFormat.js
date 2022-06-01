sap.ui.define([
	"./ListFormat.controller",
	"./FormatHelper",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView"
], function(ListFormatController, FormatHelper, oCore, XMLView) {
	"use strict";

	sap.ui.define("local/LocaleListItem", function() {
		return FormatHelper.LocaleListItem;
	});

	XMLView.create({
		viewName: "local.ListFormat",
		controller: new ListFormatController()
	}).then(function(oView) {
		oCore.getMessageManager().registerObject(oView.getContent()[0], true);
		oView.placeAt("content");
	});

});
