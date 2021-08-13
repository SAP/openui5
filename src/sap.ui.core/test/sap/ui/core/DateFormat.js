sap.ui.define([
	"./DateFormat.controller",
	"./FormatHelper",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView"
], function(DateFormatController, FormatHelper, oCore, XMLView) {
	"use strict";

	sap.ui.define("local/LocaleListItem", function() {
		return FormatHelper.LocaleListItem;
	});

	XMLView.create({
		viewName: "local.DateFormat",
		controller: new DateFormatController()
	}).then(function(oView) {
		oCore.getMessageManager().registerObject(oView.getContent()[0], true);
		oView.placeAt("content");
	});

});
